import { useSequentialState, delay } from 'react-seq';

export function useAnsi(dataSource, options = {}) {
  const {
    modemSpeed = 56000,
    frameDuration = 100,
    blinkDuration = 500,    
    blinking = false,
    transparency = false,
    minWidth = 80,
    minHeight = 24,
    maxWidth = 80,
    maxHeight = 100,
    onBeep,
    onError,
  } = options;
  return useSequentialState(async function*({ initial, signal }) {
    // screen is at minimum dimensions and empty initially
    let screen = {
      width: minWidth, 
      height: minHeight,
      blinked: false, 
      lines: Array(minHeight).fill([ { text: ' '.repeat(minWidth), fgColor: 7, bgColor: 0, blink: false, transparent: true } ]),
      willBlink: false,
    };
    // obtain data, should be an ArrayBuffer
    let data, initialized;
    if (typeof(dataSource.then) === 'function') {
      // dataSource is a promise, make empty screen the initial state
      initial(screen);
      initialized = true;
      try {
        data = await dataSource;
      } catch (err) {
        // use text from error
        data = toCP437(err.message);
        onError?.(err);
      }
    } else {
      // return initial state when we have real contents
      initialized = false;
      data = dataSource;
    }
    const chars = new Uint8Array(data);
    let maxCursorX = 0, maxCursorY = 0;
    // process data in two passes: the first determines the maximum extent of the contents
    // while the second pass actually outputs them
    for (let pass = 1; pass <= 2; pass++) {
      // screen states
      let width, height;
      let cursorX = 0, cursorY = 0, savedCursorX = 0, savedCursorY = 0;
      let bgColorBase = 0, bgColor = 0, bgBright = false;
      let fgColorBase = 7, fgColor = 7, fgBright = false;
      let blinked = false;
      let buffer = null, escapeSeq = null;
      if (pass === 1) {
        // there's no need to do the first pass if the minimum dimensions match the maximum
        if (minWidth !== maxWidth || minHeight !== maxHeight) {
          chars.map(processCharacter);
        }
      } else if (pass === 2) {
        // calculate the number of frames during which blinking text stays visible or invisible
        const blinkFrameCount = Math.ceil(blinkDuration / frameDuration);
        let blinkFramesRemaining = blinkFrameCount;
        // determine the screen dimension
        width = Math.max(minWidth, maxCursorX + 1);
        height = Math.max(minHeight, maxCursorY + 1);
        // create buffer, filling it with default text attribute
        buffer = new Uint16Array(width * height);
        buffer.fill(cell(0));
        // process data in a multiple chunks 
        const animationSpeed = modemSpeed / 10 / 1000;
        const chunkLength = Math.floor(animationSpeed * frameDuration);
        for (let i = 0; i < chars.length; i += chunkLength) {
          if (i > 0) {
            // wait for previous frame to end
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
          chars.subarray(i, i + chunkLength).map(processCharacter);
          // done with this chunk, time to output what's held in the screen buffer to the hook consumer,
          // consolidating characters with identical attributes into segments 
          screen = scanBuffer();
          if (!initialized) {
            // initialize with real contents
            initial(screen);
            initialized = true;
          } else {
            yield screen;
          }
        }
        // go into an endless loop if there's blinking text (unless blinking is just truthy and not true)
        if (screen.willBlink && blinking === true) {
          // wait out the remaining blink period
          await delay(frameDuration * blinkFramesRemaining, { signal });
          for (;;) {
            blinked = !blinked;
            yield { ...screen, blinked };
            await delay(blinkDuration, { signal });
          }
        }    
      }
      
      // --- helper functions below ----
     
      function cell(c) {
        // pack text attributes and codepoint into 16-bit cell
        return (bgColor << 8) | (fgColor << 12) | c;
      }

      // eslint-disable-next-line no-loop-func
      function setCharacter(c) {
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
          if (cursorY >= maxHeight) {
            cursorY = maxHeight - 1;
          }
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
        } else {
          if (c === 0x07) {
            onBeep?.();
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
          } else if (c === 0x1b) {
            escapeSeq = [ c ];
          } else {
            setCharacter(c);
          }
        }
      }
      
      // eslint-disable-next-line no-loop-func
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
            } else if (m === 8) {
              fgColorBase = bgColorBase;
            } else if (m === 25) {
              bgBright = false;
            } else if (m >= 30 && m <= 37) {
              fgColorBase = m - 30;
            } else if (m >= 40 && m <= 47) {
              bgColorBase = m - 40;
            }
          }
          fgColor = fgColorBase + (fgBright ? 8 : 0);
          bgColor = bgColorBase + (bgBright ? 8 : 0);
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
        const transparencyMask = (transparency) ? 0x0001 : 0x0000;
        let willBlink = false;
        for (let row = 0; row < height; row++) {
          const segments = [];
          const first = row * width;
          const last = first + width;
          let attr = 0x00FF;  // invalid attributes
          let text = '';
          // find where there's a change in attributes
          for (let i = first; i < last; i++) {
            const cp = buffer[i] & 0x00FF;
            // codepoint 0 means nothing was drawn there
            const newAttr = (buffer[i] & 0xFF00) | (cp === 0 && transparencyMask);
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
            const transparent = (attr & transparencyMask) !== 0;
            const bgColor = (attr & bgColorMask) >> 8;
            const fgColor = (attr & fgColorMask) >> 12;
            line.push({ text, fgColor, bgColor, blink, transparent });
            willBlink = willBlink || blink;
          }
          lines.push(line);
        }
        return { width, height, lines, blinked, willBlink };
      }
    } 
    if (!initialized) {
      // the data source was empty--initialize with empty screen
      initial(screen);
    }
  }, [ dataSource, modemSpeed, frameDuration, blinkDuration, blinking, minWidth, minHeight, maxWidth, maxHeight, transparency, onBeep, onError ]);
}

function toCP437(msg) {
  const array = new Uint8Array(msg.length);
  const oob = cp437Chars.indexOf('?');
  for (let i = 0; i < msg.length; i++) {
    const cp = cp437Chars.indexOf(msg.charAt(i));
    array[i] = (cp !== -1) ? cp : oob;
  }
  return array.buffer;
}

const cp437Chars = [
  '\u0000', '\u263a', '\u263b', '\u2665', '\u2666', '\u2663', '\u2660', '\u0007', '\u0008', '\u0009', '\u000a', '\u2642', '\u000c', '\u000d', '\u266b', '\u263c',
  '\u25ba', '\u25c4', '\u2195', '\u203c', '\u00b6', '\u00a7', '\u25ac', '\u21a8', '\u2191', '\u2193', '\u2192', '\u001b', '\u221f', '\u2194', '\u25b2', '\u25bc',
  '\u0020', '\u0021', '\u0022', '\u0023', '\u0024', '\u0025', '\u0026', '\u0027', '\u0028', '\u0029', '\u002a', '\u002b', '\u002c', '\u002d', '\u002e', '\u002f',
  '\u0030', '\u0031', '\u0032', '\u0033', '\u0034', '\u0035', '\u0036', '\u0037', '\u0038', '\u0039', '\u003a', '\u003b', '\u003c', '\u003d', '\u003e', '\u003f',
  '\u0040', '\u0041', '\u0042', '\u0043', '\u0044', '\u0045', '\u0046', '\u0047', '\u0048', '\u0049', '\u004a', '\u004b', '\u004c', '\u004d', '\u004e', '\u004f',
  '\u0050', '\u0051', '\u0052', '\u0053', '\u0054', '\u0055', '\u0056', '\u0057', '\u0058', '\u0059', '\u005a', '\u005b', '\u005c', '\u005d', '\u005e', '\u005f',
  '\u0060', '\u0061', '\u0062', '\u0063', '\u0064', '\u0065', '\u0066', '\u0067', '\u0068', '\u0069', '\u006a', '\u006b', '\u006c', '\u006d', '\u006e', '\u006f',
  '\u0070', '\u0071', '\u0072', '\u0073', '\u0074', '\u0075', '\u0076', '\u0077', '\u0078', '\u0079', '\u007a', '\u007b', '\u007c', '\u007d', '\u007e', '\u007f',
  '\u00c7', '\u00fc', '\u00e9', '\u00e2', '\u00e4', '\u00e0', '\u00e5', '\u00e7', '\u00ea', '\u00eb', '\u00e8', '\u00ef', '\u00ee', '\u00ec', '\u00c4', '\u00c5',
  '\u00c9', '\u00e6', '\u00c6', '\u00f4', '\u00f6', '\u00f2', '\u00fb', '\u00f9', '\u00ff', '\u00d6', '\u00dc', '\u00a2', '\u00a3', '\u00a5', '\u20a7', '\u0192',
  '\u00e1', '\u00ed', '\u00f3', '\u00fa', '\u00f1', '\u00d1', '\u00aa', '\u00ba', '\u00bf', '\u2310', '\u00ac', '\u00bd', '\u00bc', '\u00a1', '\u00ab', '\u00bb',
  '\u2591', '\u2592', '\u2593', '\u2502', '\u2524', '\u2561', '\u2562', '\u2556', '\u2555', '\u2563', '\u2551', '\u2557', '\u255d', '\u255c', '\u255b', '\u2510',
  '\u2514', '\u2534', '\u252c', '\u251c', '\u2500', '\u253c', '\u255e', '\u255f', '\u255a', '\u2554', '\u2569', '\u2566', '\u2560', '\u2550', '\u256c', '\u2567',
  '\u2568', '\u2564', '\u2565', '\u2559', '\u2558', '\u2552', '\u2553', '\u256b', '\u256a', '\u2518', '\u250c', '\u2588', '\u2584', '\u258c', '\u2590', '\u2580',
  '\u03b1', '\u00df', '\u0393', '\u03c0', '\u03a3', '\u03c3', '\u00b5', '\u03c4', '\u03a6', '\u0398', '\u03a9', '\u03b4', '\u221e', '\u03c6', '\u03b5', '\u2229',
  '\u2261', '\u00b1', '\u2265', '\u2264', '\u2320', '\u2321', '\u00f7', '\u2248', '\u00b0', '\u2219', '\u00b7', '\u221a', '\u207f', '\u00b2', '\u25a0', '\u00a0',
];
