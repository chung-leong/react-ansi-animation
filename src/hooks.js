import { useRef, useEffect } from 'react';
import { useSequentialState, delay } from 'react-seq';
import { toCP437, cp437Chars } from './dos-environment.js';

const defaultStatus = { position: 0, playing: true };
const promisedData = new WeakMap();

export function useAnsi(dataSource, options = {}) {
  const {
    modemSpeed = 56000,
    frameDuration = 50,
    blinkDuration = 500,    
    blinking = false,
    transparency = false,
    minWidth = 79,
    minHeight = 22,
    maxWidth = 80,
    maxHeight = 25,
    initialStatus = defaultStatus,
    onStatus,
    onError,
    onMetadata,
    beep,
  } = options;
  const state = useSequentialState(async function*({ initial, mount, signal }) {
    // screen is at minimum dimensions and empty initially
    let state = {
      width: minWidth, 
      height: minHeight,
      blinked: false, 
      lines: Array(minHeight).fill([ { text: ' '.repeat(minWidth), fgColor: undefined, bgColor: undefined, blinking, blink: false } ]),
      willBlink: false,
      status: initialStatus,
      metadata: null,
      error: null,
    };
    let data = null, initialized = false, error = null;
    if (typeof(dataSource?.then) === 'function') {
      data = promisedData.get(dataSource);
      if (!data) {
        try {
            // set initial state now, since we need to wait for data to show up
          initial(state);
          initialized = true;
          data = await dataSource;
        } catch (err) {
          data = err.message;
          error = err;
        }
        // remember the data
        promisedData.set(dataSource, data);
      }
    } else {
      data = dataSource;
    }
    if (typeof(data) === 'string') {
      data = toCP437(data);
    }
    let chars = new Uint8Array(data);
    let detectedWidth = 0, detectedHeight = 0;
    // process data in two passes: the first determines the maximum extent of the contents
    // while the second pass actually outputs them
    for (let pass = 1; pass <= 2; pass++) {
      // screen states
      let width = detectedWidth, height = detectedHeight;
      let cursorX = 0, cursorY = 0, savedCursorX = 0, savedCursorY = 0, maxCursorX = 0, maxCursorY = 0;
      let bgColor = 0, fgColor = 7, bgColorBase = 0, fgColorBase = 7, bgBright = false, fgBright = false;
      let transparencyFlags = 0, bgSet = false, fgSet = false;
      let buffer = null, blinked = false, willBlink = false;
      let escapeSeq = null, eof = false, metadata = null, metaString = '';
      if (pass === 1) {
        // there's no need to do the first pass if the minimum dimensions match the maximum
        if (minWidth !== maxWidth || minHeight !== maxHeight) {
          chars.map(processCharacter);
        }
        detectedWidth = Math.max(minWidth, maxCursorX + 1);
        detectedHeight = Math.max(minHeight, maxCursorY + 1);
      } else if (pass === 2) {
        // calculate the number of frames during which blinking text stays visible or invisible
        const blinkFrameCount = Math.ceil(blinkDuration / frameDuration);
        let blinkFramesRemaining = blinkFrameCount;
        // create buffer, using 32-bit integers when handling transparency
        buffer = (transparency) ? new Uint32Array(width * height) : new Uint16Array(width * height);
        // fill buffer with default attributes
        buffer.fill(cell(0));
        metadata = [];
        // process data in a multiple chunks 
        const animationSpeed = modemSpeed / 10 / 1000;
        const chunks = [];
        let i = 0;
        if (initialStatus.position > 0) {
          // add initial chunk
          i = Math.floor(initialStatus.position * chars.length);
          chunks.push(chars.subarray(0, i));
        }
        if (initialStatus.playing) {
          // add remaining chunks
          const chunkLength = Math.floor(animationSpeed * frameDuration);
          while (i < chars.length) {
            chunks.push(chars.subarray(i, i + chunkLength));
            i += chunkLength;
          }
        }
        let processed = 0;
        for (const [ index, chunk ] of chunks.entries()) {
          chunk.map(processCharacter);
          // time to output what's held in the screen buffer to the hook consumer,
          // consolidating characters with identical attributes into segments 
          const lines = scanBuffer();
          // calculate status
          processed += chunk.length;
          const playing = (index !== chunks.length - 1);
          const position = processed / chars.length;
          const status = { position, playing };
          state = { width, height, blinking, blinked, lines, willBlink, status, metadata, error };
          if (!initialized) {
            // initialize with real contents
            initial(state);
            initialized = true;
            await mount();
          } else {
            yield state;
          }
          if (playing) {
            // wait for frame to end
            await delay(frameDuration, { signal });
            if (blinking) {
              // update blink states
              blinkFramesRemaining--;
              if (blinkFramesRemaining === 0) {
                blinked = !blinked;
                blinkFramesRemaining = blinkFrameCount;
              }
            }
          }
        }
        data = chars = buffer = null;

        // go into an endless loop if there's blinking text (unless blinking is just truthy and not true)
        if (state.willBlink && blinking === true) {
          // wait out the remaining blink period
          await delay(frameDuration * blinkFramesRemaining, { signal });
          for (;;) {
            blinked = !blinked;
            yield { ...state, blinked };
            await delay(blinkDuration, { signal });
          }
        }
      }
      
      // --- helper functions below ----
     
      function cell(c) {
        // pack text attributes and codepoint into 16-bit cell
        return (bgColor << 8) | (fgColor << 12) | c | transparencyFlags;
      }

      function setCharacter(c) {
        if (cursorY >= maxHeight) {
          if (buffer) {
            // scroll up
            processCommand('S', `${cursorY - maxHeight + 1}`);
          }
          cursorY = maxHeight - 1;
        }
        if (!buffer) {
          if (cursorX > maxCursorX) {
            maxCursorX = cursorX;
          }
          if (cursorY > maxCursorY) {
            maxCursorY = cursorY;
          }
        } else {
          buffer[cursorY * width + cursorX] = cell(c);
        }
        cursorX++;
        if (cursorX >= maxWidth) {
          cursorX = 0;
          cursorY++;
        }
      }
      
      function parseOne(text, def1) {
        return (text) ? parseInt(text) : def1;
      }
    
      function parseTwo(text, def1, def2) {
        const parts = text.split(';');
        return [ parseOne(parts[0], def1), parseOne(parts[1], def2) ];
      }
    
      function parseMultiple(text, def) {
        const parts = text.split(';');
        return parts.map(p => parseOne(p, def));
      }

      function processCharacter(c) {
        if (escapeSeq) {
          if (escapeSeq.length === 1) {
            escapeSeq.push(c);
            if (c !== 0x5b) {
              // invalid sequence
              for (const c of escapeSeq) {
                setCharacter(c);
              }
              escapeSeq = null;
            }
          } else {
            if (c >= 0x40 && c <= 0x7e) {
              // @ to ~
              const cmd = cp437Chars[c];
              const params = escapeSeq.slice(2).map(c => cp437Chars[c]).join('');
              processCommand(cmd, params);
              escapeSeq = null;
            } else {
              escapeSeq.push(c);
            }
          }
        } else if (!eof) {
          if (c === 0x07) {
            beep?.();
          } else if (c === 0x08) {
            // backspace
            cursorX--;
            if (cursorX < 0) {
              cursorX = 0;
            }
          } else if (c === 0x09) {
            // tabs
            cursorX = ((cursorX >> 3) << 3) + 8;
          } else if (c === 0x0a) {
            // linefeed
            cursorY++;
          } else if (c === 0x0c) {
            // clear screen
            processCommand('J', 2);
          } else if (c === 0x0d) {
            // carriage return
            cursorX = 0;
          } else if (c === 0x1a) {
            eof = true;
          } else if (c === 0x1b) {
            escapeSeq = [ c ];
          } else {
            setCharacter(c);
          }
        } else {
          // metadata
          if (metadata) {
            if (c === 0 || c === 0x1a) {
              if (metaString) {
                metadata.push(metaString);
                metaString = '';
              }
            } else {
              metaString += cp437Chars[c];
            }
          }
        }
      }
      
      function processCommand(cmd, params = '') {
        if (cmd === 'A') {
          const count = parseOne(params, 1);
          cursorY -= count;
          if (cursorY < 0) {
            cursorY = 0;
          }
        } else if (cmd === 'B') {
          const count = parseOne(params, 1);
          cursorY += count;
          if (cursorY >= maxHeight) {
            cursorY = maxHeight - 1;
          }
        } else if (cmd === 'C') {
          const count = parseOne(params, 1);
          cursorX += count;
          if (cursorX >= maxWidth) {
            cursorX = maxWidth - 1;
          }
        } else if (cmd === 'D') {
          const count = parseOne(params, 1);
          cursorX -= count;
          if (cursorX < 0) {
            cursorX = 0;
          }
        } else if (cmd === 'H' || cmd === 'f') {
          const [ row, col ] = parseTwo(params, 1, 1);
          cursorX = Math.min(col, maxWidth) - 1;
          cursorY = Math.min(row, maxHeight)- 1;
        } else if (cmd === 'J') {
          // clear screen
          const mode = parseOne(params, 0);
          if (buffer) {
            let start, end;
            if (mode === 0) {
              start = cursorY * width + cursorX;
              end = width * height;
            } else if (mode === 1) {
              start = 0;
              end = cursorY * width + cursorX;
            } else if (mode === 2) {
              start = 0;
              end = width * height;
            }
            buffer.fill(cell(0), start, end);;
          }
          if (mode === 2) {
            cursorX = 0;
            cursorY = 0;
          }
        } else if (cmd === 'K') {
          // clear line to end
          const mode = parseOne(params, 0);
          if (buffer) {
            let start, end;
            if (mode === 0) {
              start = cursorY * width + cursorX;
              end = (cursorY + 1) * width; 
            } else if (mode === 1) {
              start = cursorY * width;
              end = start + cursorX; 
            } else if (mode === 2) {
              start = cursorY * width;
              end = start + width;
            }
            buffer.fill(cell(0), start, end);
          }
        } else if (cmd === 'L') {
          // insert line
          const count = parseOne(params, 1);
          if (buffer) {
            const target = (cursorY + count) * width;
            const source = cursorY * width;
            buffer.copyWithin(target, source);
            const start = source;
            const end = target;
            buffer.fill(cell(0), start, end);
          }
          if (cursorY <= maxCursorY) {
            maxCursorY += count;
          }
        } else if (cmd === 'M') {
          // delete line
          const count = parseOne(params, 1);
          if (buffer) {
            const target = cursorY * width;
            const source = (cursorY + count) * width;
            buffer.copyWithin(target, source);
            const start = source;
            const end = width * height;
            buffer.fill(cell(0), start, end);
          }
        } else if (cmd === 'P') {
          // delete characters
          const count = parseOne(params, 1);
          if (buffer) {
            const target = cursorY * width + cursorX;
            const source = target + count;
            const last = (cursorY + 1) * width;
            buffer.copyWithin(target, source, last);
            const start = last - count;
            const end = last;
            buffer.fill(cell(0), start, end);
          }
        } else if (cmd === 'S') {
          // scroll up
          const count = parseOne(params, 1);
          if (buffer) {
            const target = 0;
            const source = count * width;
            buffer.copyWithin(target, source);
            const start = width * (height - count);
            const end = width * height;
            buffer.fill(cell(0), start, end);
          }
        } else if (cmd === 'T') {
          // scroll down
          const count = parseOne(params, 1);
          if (buffer) {
            const target = count * width;
            const source = 0;
            buffer.copyWithin(target, source);
            const start = 0;
            const end = count * width;
            buffer.fill(cell(0), start, end);
          }
        } else if (cmd === 'X') {
          // clear characters
          const count = parseOne(params, 1);
          if (buffer) {
            const start = cursorY * width + cursorX;
            const end = Math.min(start + count, (cursorY + 1) * width);
            buffer.fill(cell(0), start, end);
          }
        } else if (cmd === 'm') {
          // modify text properties
          const modifiers = parseMultiple(params, 0);
          for (const m of modifiers) {
            if (m === 0) {
              fgBright = false;
              bgBright = false;
              fgColorBase = 7;
              bgColorBase = 0;
              fgSet = false;
              bgSet = false;
            } else if (m === 1) {
              fgBright = true;
            } else if (m === 2 || m === 22) {
              fgBright = false;
            } else if (m === 5 || m === 6) {
              bgBright = true;
            } else if (m === 7) {
              const fgColorBefore = fgColorBase;
              fgColorBase = bgColorBase;
              bgColorBase = fgColorBefore;
              fgSet = true;
              bgSet = true;
            } else if (m === 8) {
              fgColorBase = bgColorBase;
              fgSet = true;
            } else if (m === 25) {
              bgBright = false;
            } else if (m >= 30 && m <= 37) {
              fgColorBase = m - 30;
              fgSet = true;
            } else if (m >= 40 && m <= 47) {
              bgColorBase = m - 40;
              bgSet = true;
            }
          }
          fgColor = fgColorBase + (fgBright ? 8 : 0);
          bgColor = bgColorBase + (bgBright ? 8 : 0);
          if (transparency) {
            transparencyFlags = (fgSet ? 0x00010000 : 0) | (bgSet ? 0x00020000 : 0);
          }
        } else if (cmd === 's') {
          savedCursorX = cursorX;
          savedCursorY = cursorY;
        } else if (cmd === 'u') {
          cursorX = savedCursorX;
          cursorY = savedCursorY;
        }
      } 

      function scanBuffer() {
        const lines = [];
        const blinkMask = (blinking) ? 0x0800 : 0x0000;
        const bgColorMask = (blinking) ? 0x0700 : 0x0F00;
        const fgColorMask = 0xF000;
        const fgMask = 0x00010000;
        const bgMask = 0x00020000;
        for (let row = 0; row < height; row++) {
          const segments = [];
          const first = row * width;
          const last = first + width;
          let attr = 0x00FF;  // invalid attributes
          let text = '';
          // find where there's a change in attributes
          for (let i = first; i < last; i++) {
            const cp = buffer[i] & 0x00FF;
            const newAttr = buffer[i] & 0x000FFF00;
            if (attr !== newAttr) {
              // add preceding text
              if (text.length > 0) {
                segments.push({ attr, text });
              }
              attr = newAttr;
              text = '';
            }
            // map codepoint 0 to space
            text += cp437Chars[cp || 0x20];
          }
          // add leftover at end of line
          if (text.length > 0) {
            segments.push({ attr, text });
          }
          const line = [];
          for (const { attr, text } of segments) {
            const blink = (attr & blinkMask) !== 0;
            const fgColor = (!transparency || (attr & fgMask)) ? (attr & fgColorMask) >> 12 : undefined;
            const bgColor = (!transparency || (attr & bgMask)) ? (attr & bgColorMask) >> 8 : undefined;
            line.push({ text, fgColor, bgColor, blink });
            willBlink = willBlink || blink;
          }
          lines.push(line);
        }
        return lines;
      }
    } 
    if (!initialized) {
      // the data source was empty--initialize with empty screen
      initial(state);
    }
  }, [ dataSource, modemSpeed, frameDuration, blinkDuration, blinking, minWidth, minHeight, maxWidth, maxHeight, transparency, initialStatus, beep ]);
  // saving handlers into a ref so we don't trigger useEffect when they're different
  const handlerRef = useRef();
  handlerRef.current = { onStatus, onMetadata, onError };
  // relay events to event handlers
  const { status, metadata, error } = state;
  useEffect(() => { 
    handlerRef.current.onStatus?.(status); 
  }, [ status ]);
  useEffect(() => { 
    handlerRef.current.onMetadata?.(metadata); 
  }, [ metadata ]);
  useEffect(() => { 
    if (error)  {
      handlerRef.current.onError?.(error);
    }
  }, [ error ]);
  return state;
}

