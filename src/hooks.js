import { useSequentialState, delay } from 'react-seq';

export function useAnsi(dataSource, options) {
  const {
    modemSpeed = 56000,
    frameDuration = 100,
    blinkDuration = 500,    
    blinking = false,
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
      lines: Array(minHeight).fill([ { text: ' '.repeat(minWidth), fgColor: 7, bgColor: 0, blink: false } ]),
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
      initialized = false;
      data = dataSource;
    }
    const chars = new Uint8Array(data);
    // calculate the number frames pass before we need to flip the blink state
    const blinkFrameCount = Math.ceil(blinkDuration / frameDuration);
    let blinked = false, blinkFramesRemaining = blinkFrameCount;
    let maxCursorX = 0, maxCursorY = 0;
    // process data in two passes: the first determines the maximum extent of the contents
    // while the second pass actually outputs them
    for (let pass = 1; pass <= 2; pass++) {
      let width, height;
      let buffer = null;
      if (pass === 1) {
        // there's no need to the first pass if the minimum dimensions match the maximum
        if (minWidth === maxWidth && minHeight === maxHeight) {
          continue;
        }
      } else if (pass === 2) {
        // determine the screen dimension
        width = Math.max(minWidth, maxCursorX + 1);
        height = Math.max(minHeight, maxCursorY + 1);
        // create buffer
        buffer = new Uint16Array(width * height);
        // fill buffer with default text attribute
        buffer.fill(7 << 12 | 0 << 8);
      }
      // screen states
      let cursorX = 0, cursorY = 0;
      let savedCursorX = 0, savedCursorY = 0;
      let bgColorBase = 7, fgColorBase = 0;
      let bgBright = false, fgBright = false;
      let bgColor = 0, fgColor = 7;
      let escapeSeq = null;
      // process data in a single chunk on pass 1 and multiple chunks on pass 2 
      // (unless modemSpeed is set to Infinity)
      const animationSpeed = (pass === 1) ? Infinity : modemSpeed / 10 / 1000;
      const chunkLength = Math.floor(animationSpeed * frameDuration);
      for (let i = 0; i < chars.length; i += chunkLength) {
        if (pass === 2 && i > 0) {
          // wait for previous frame to end
          await delay(frameDuration, { signal });
        }
        for (const c of chars.subarray(i, i + chunkLength)) {
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
            if (c === 0x00) {
              break;
            } else if (c === 0x07) {
              onBeep?.();
            } else if (c === 0x08) {
              cursorX--;
              if (cursorX < 0) {
                cursorX = 0;
              }
            } else if (c === 0x09) {
              // tab
            } else if (c === 0x0a) {
              cursorY++;
            } else if (c === 0x0c) {
              processCommand('J', 2);
            } else if (c === 0x0d) {
              cursorX = 0;
            } else if (c === 0x1a) {
              break;
            } else if (c === 0x1b) {
              escapeSeq = [ c ];
            } else {
              setCharacter(c);
            }
          }
        }
        if (pass === 1) {
          // we're done--the first pass doesn't output anything
          continue;
        }
        // convert screen buffer to lines of text segments
        // and output them to hook consumer
        const lines = [];
        const blinkMask = (blinking) ? 0x0008 : 0;
        const bgColorMask = (blinking) ? 0x0007 : 0x000F;
        const fgColorMask = 0x000F;
        let willBlink = false;
        for (let row = 0; row < height; row++) {
          const segments = [];
          const first = row * width;
          const last = first + width;
          let attr = 0x00FF;
          let text = '';
          // find where there's a change in attributes
          for (let i = first; i < last; i++) {
            const newAttr = buffer[i] & 0xFF00;
            const cp = buffer[i] & 0x00FF;
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
            const blink = ((attr >> 8) & blinkMask) !== 0;
            const bgColor = (attr >> 8) & bgColorMask;
            const fgColor = (attr >> 12) & fgColorMask;
            line.push({ text, fgColor, bgColor, blink });
            willBlink ||= blink;
          }
          lines.push(line);
        }
        screen = { width, height, lines, blinked, willBlink };
        if (!initialized) {
          // initialize with real contents
          initial(screen);
          initialized = true;
        } else {
          yield screen;
        }
        if (blinking) {
          blinkFramesRemaining--;
          if (blinkFramesRemaining === 0) {
            blinked = !blinked;
            blinkFramesRemaining = blinkFrameCount;
          }
        }
      } // end of chunk processing

      // --- helper functions down here ----
      
      function setCharacter(char) {
        if (!buffer) {
          if (cursorX > maxCursorX) {
            maxCursorX = cursorX;
          }
          if (cursorY > maxCursorY) {
            maxCursorY = cursorY;
          }
        } else {
          // calculate cell position
          const index = cursorY * width + cursorX;
          // pack into 16-bit cell
          buffer[index] = (bgColor << 8) | (fgColor << 12) | char;
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
    
      function parseMultiple(text) {
        const parts = text.split(';');
        return parts.map(p => parseOne(p));
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
          if (col <= maxWidth) {
            cursorX = col - 1;
          }
          if (row <= maxHeight) {
            cursorY = row - 1;
          }
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
            buffer.fill(bgColor << 8, start, end);;
          }
          if (mode === 2) {
            cursorX = 0;
            cursorY = 0;
          }
        } else if (cmd === 'K') {
          // clear line to end
          if (buffer) {
            const start = cursorY * width + cursorX;
            const end = (cursorY + 1) * width;
            buffer.fill(bgColor << 8, start, end);
          }
        } else if (cmd === 'L') {
          // insert line
          const count = parseOne(params, 0);
          if (buffer) {
            const target = (cursorY + count) * width;
            const source = cursorY * width;
            buffer.copyWithin(target, source);
            const start = source;
            const end = target;
            buffer.fill(bgColor << 8, start, end);
          }
          if (cursorY <= maxCursorY) {
            maxCursorY += count;
          } else {
            maxCursorY = cursorY + count;
          }
        } else if (cmd === 'M') {
          // delete line
          const count = parseOne(params, 0);
          if (buffer) {
            const target = cursorY * width;
            const source = (cursorY + count) * width;
            buffer.copyWithin(target, source);
            const start = source;
            const end = width * height;
            buffer.fill(bgColor << 8, start, end);;
          }
        } else if (cmd === 'X') {
          // delete characters
          const count = parseOne(params, 0);
          if (buffer) {
            const target = cursorY * width + cursorX;
            const source = target + count;
            const last = (cursorY + 1) * width;
            buffer.copyWithin(target, source, last);
            const start = source;
            const end = last;
            buffer.fill(bgColor << 8, start, end);;
          }
        } else if (cmd === 'm') {
          // modify text properties
          const modifiers = parseMultiple(params);
          if (modifiers.length === 0) {
            modifiers.push(0);
          }
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
    } // end of pass
    // handle empty data source
    if (!initialized) {
      initial(screen);
    }
    // go into an endless loop if there's blinking text
    // unless blinking is just truthy
    if (screen.willBlink && blinking === true) {
      // wait out the remaining blink period
      await delay(frameDuration * blinkFramesRemaining, { signal });
      for (;;) {
        blinked = !blinked;
        yield { ...screen, blinked };
        await delay(blinkDuration, { signal });
      }
    }    
  }, [ dataSource, modemSpeed, frameDuration, blinkDuration, blinking, minWidth, minHeight, maxWidth, maxHeight ]);
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