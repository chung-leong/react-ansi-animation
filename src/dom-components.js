import { useMemo, useRef, useEffect, createElement } from 'react';
import { useAnsi } from './hooks.js';
import { cgaPalette } from './dos-environment.js';

export function AnsiText({ src, srcObject, palette = cgaPalette, className = 'AnsiText', ...options }) {
  // retrieve data if necessary
  const data = useMemo(() => srcObject ?? fetchBuffer(src), [ src, srcObject ]);
  // process data through hook
  const { lines, blinking, blinked } = useAnsi(data, options);
  // convert lines to spans
  const children = lines.map((segments) => {
    const spans = segments.map(({ text, fgColor, bgColor, blink }) => {
      const props = {};
      if (Array.isArray(palette)) {
        props.style = {
          backgroundColor: palette[bgColor],
          color: palette[(blink && blinked) ? bgColor : fgColor],
        };
      } else {
        const names = [];
        if (fgColor !== undefined) {
          names.push(`fgColor${fgColor}`)
        }
        if (bgColor !== undefined) {
          names.push(`bgColor${bgColor}`);
        }
        if (blink) {
          if (blinking === true) {
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
    display: 'inline-block',
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
    let { color, font } = getCanvasStyle(canvas);
    if (document.fonts.check(font)) {
      draw();
      // observe resizing of element so any font changes get applied
      const observer = new ResizeObserver(() => {
        const { font: newFont, color: newColor } = getCanvasStyle(canvas);        
        if (newFont !== font || newColor !== color) {
          font = newFont;
          color = newColor;
          draw();
        }
      });
      observer.observe(canvas);
      return () => observer.disconnect();
    } else {
      // draw when the font has been loaded
      let cancelled = false;
      document.fonts.load(font).then(() => {
        if (!cancelled) {
          draw();
        }
      });
      return () => cancelled = true;
    }

    function draw() {
      const { charWidth, charHeight, ascent } = getFontMetrics(font);
      canvas.width = width * charWidth;
      canvas.height = height * charHeight;
      const cxt = canvas.getContext('2d');
      cxt.clearRect(0, 0, canvas.width, canvas.height);
      cxt.font = font;
      let x = 0, y = ascent;
      for (const line of lines) {
        for (const { text, bgColor, fgColor, blink } of line) {
          for (let i = 0; i < text.length; i++) {
            if (bgColor !== undefined) {
              // fill background with block character for more consistent appearance
              // if the full-block character doesn't quote fill the cell, then the gaps between
              // cells should appear everywhere
              cxt.fillStyle = palette[bgColor];
              cxt.fillText('\u2588', x, y);
            }
            if (!blink || !blinked) {
              // use black if foreground color isn't set
              cxt.fillStyle = (fgColor !== undefined) ? palette[fgColor] : color;
              cxt.fillText(text.charAt(i), x, y);
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

function getCanvasStyle(node) {
  const { fontStyle, fontWeight, fontSize, fontFamily, color } = getComputedStyle(node);
  const font = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`; 
  return { color, font };
}

const fontMetrics = {};

function getFontMetrics(specifier) {
  let metrics = fontMetrics[specifier];
  if (!metrics) {
    const canvas = document.createElement('CANVAS');
    const cxt = canvas.getContext('2d');
    cxt.font = specifier;
    const m = cxt.measureText('\u2588');
    // support for fontBoundingBoxAscent and fontBoundingBoxDescent is spotty
    // (https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics#browser_compatibility)
    // 
    // actualBoundingBoxAscent and actualBoundingBoxDescent wouldn't yield the exactly result
    // since the bounding box of the full-block character (U+2588) will likely stick out just a little
    const ascent = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
    const descent = m.fontBoundingBoxDescent ?? m.actualBoundingBoxDescent;
    const charWidth = m.width;
    const charHeight = ascent + descent;
    metrics = fontMetrics[specifier] = { ascent, descent, charWidth, charHeight };
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

