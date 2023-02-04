import { useMemo, useRef, useEffect, createElement } from 'react';
import { useAnsi } from './hooks.js';
import { cgaPalette } from './dos-environment.js';

export function AnsiText({ src, srcObject, palette = cgaPalette, className = 'AnsiText', ...options }) {
  // retrieve data if necessary
  const data = useMemo(() => srcObject ?? fetchBuffer(src), [ src, srcObject ]);
  // process data through hook
  const { lines, blinked } = useAnsi(data, options);
  // convert lines to spans
  const children = lines.map((segments) => {
    const spans = segments.map(({ text, fgColor, bgColor, blink, transparent }) => {
      const props = {};
      if (Array.isArray(palette)) {
        props.style = {
          backgroundColor: (transparent) ? undefined : palette[bgColor],
          color: palette[(blink && blinked) ? bgColor : fgColor],
        };
      } else {
        const names = [];
        names.push(`fgColor${fgColor}`)
        if (!transparent) {
          names.push(`bgColor${bgColor}`);
        }
        if (blink) {
          if (options.blinking === true) {
            // manual blinking
            if (blink && blinked) {
              names.push('blink');
            }
          } else {
            // blinking through css
            names.push('blinking');
          }
        }
        props.className = names.join(' ');
      }
      return createElement('span', props, text);
    });
    return createElement('div', {}, ...spans);
  });
  const style = {
    display: 'block',
    whiteSpace: 'pre', 
    width: 'fit-content',
  };
  return createElement('code', { className, style }, ...children);
}

/* c8 ignore start */
export function AnsiCanvas({ src, srcObject, palette = cgaPalette, className = 'AnsiCanvas', ...options }) {
  const canvasRef = useRef();
  // retrieve data if necessary
  const data = useMemo(() => srcObject ?? fetchBuffer(src), [ src, srcObject ]);
  // process data through hook
  const { width, height, lines, blinked } = useAnsi(data, options);
  // draw into canvas in useEffect hook
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    // get font applicable to canvas
    let specifier = getFontSpecifier(canvas);
    if (document.fonts.check(specifier)) {
      draw();
      // observe resizing of element so any font changes get applied
      const observer = new ResizeObserver(() => {
        const newSpecifier = getFontSpecifier(canvas);        
        if (newSpecifier !== specifier) {
          specifier = newSpecifier;
          draw();
        }
      });
      observer.observe(canvas);
      return () => observer.disconnect();
    } else {
      // draw when the font has been loaded
      let cancelled = false;
      document.fonts.load(specifier).then(() => {
        if (!cancelled) {
          draw();
        }
      });
      return () => cancelled = true;
    }

    function draw() {
      const { charWidth, charHeight, ascent } = getFontMetrics(specifier);
      canvas.width = width * charWidth;
      canvas.height = height * charHeight;
      const cxt = canvas.getContext('2d');
      cxt.clearRect(0, 0, canvas.width, canvas.height);
      cxt.font = specifier;
      let x = 0, y = ascent;
      for (const line of lines) {
        for (const { text, bgColor, fgColor, blink, transparent } of line) {
          for (let i = 0; i < text.length; i++) {
            if (!transparent) {
              // fill background with block character for more consistent appearance
              // if the block character doesn't quote fill the cell, then the gaps between
              // cells should appear everywhere
              cxt.fillStyle = palette[bgColor];
              cxt.fillText('\u2588', x, y);
              if (!blink || !blinked) {
                cxt.fillStyle = palette[fgColor];
                cxt.fillText(text.charAt(i), x, y);
              }
            }
            x += charWidth;
          }
        }
        y += charHeight;
        x = 0;
      }
    }
  }, [ width, height, lines, blinked, palette ]);
  return createElement('canvas', { ref: canvasRef, className });
}

function getFontSpecifier(node) {
  const { fontStyle, fontWeight, fontSize, fontFamily } = getComputedStyle(node);
  return `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`; 
}

const fontMetrics = {};

function getFontMetrics(specifier) {
  let metrics = fontMetrics[specifier];
  if (!metrics) {
    const canvas = document.createElement('CANVAS');
    const cxt = canvas.getContext('2d');
    cxt.font = specifier;
    const m = cxt.measureText('\u2588');
    const ascent = m.fontBoundingBoxAscent;
    const charHeight = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent;
    const charWidth = m.width;
    metrics = fontMetrics[specifier] = { charWidth, charHeight, ascent };
  }
  return metrics;
}
/* c8 ignore stop */

async function fetchBuffer(src, options) {
  if (src) {
    const res = await fetch(src, options);
    if (res.status !== 200) {
      throw new Error(`HTTP ${res.status} - ${res.statusText}`);
    }
    return await res.arrayBuffer(); 
  }
}

