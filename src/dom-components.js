import { useMemo, createElement } from 'react';
import { useSequentialState } from 'react-seq';
import { useAnsi } from './hooks.js';

export function AnsiText({ src, srcObject, palette = cgaPalette, className = 'AnsiText', ...options }) {
  // retrieve data if necessary
  const data = useMemo(() => {
    if (srcObject) {
      return srcObject;
    } else if (src) {
      return fetchBuffer(src);
    } else {
      return new Uint8Array(0).buffer;
    }
  }, [ src, srcObject ]);
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
    const style = {
      display: 'block',
      whiteSpace: 'pre', 
      width: 'fit-content',
    };
    return createElement('code', { style }, ...spans);
  });
  return createElement('div', { className }, ...children);
}

/* c8 ignore start */
export function AnsiCanvas({ src, srcObject, palette = cgaPalette, font = {}, ...options }) {
  const { 
    family = 'monospace',
    style = 'normal', 
    weight = 'normal',
    size = '10pt',
    src: fontSrc,
  } = font;
  const specifier = `${style} ${weight} ${size} ${family}`;
  const canvasRef = useRef();
  // retrieve data if necessary
  const data = useMemo(() => {
    if (srcObject) {
      return srcObject;
    } else if (src) {
      return fetchBuffer(src);
    } else {
      return new Uint8Array(0).buffer;
    }
  }, [ src, srcObject ]);
  // process data through hook
  const { width, height, lines, blinked } = useAnsi(data, options);
  const metrics = useSequentialState(async function*({ initial }) {
    yield getFontMetrics(specifier);     
  }, [ specifier ]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!metrics || !canvas) {
      return;
    }
    const { charWidth, charHeight, ascent, specifier } = metrics;
    canvas.width = width * charWidth;
    canvas.height = height * charHeight;
    const cxt = canvas.getContext('2d');
    cxt.font = specifier;    
    let x = 0, y = ascent;
    for (const line of lines) {
      for (const { text, bgColor, fgColor, blink, transparent } of line) {
        const drawFG = !transparent && (!blink || !blinked);
        for (let i = 0; i < text.length; i++) {
          const s = text.charAt(i);
          cxt.fillStyle = (transparent) ? 'rgba(0,0,0,0)' : palette[bgColor];
          cxt.fillText('\u2588', x, y);
          if (drawFG) {
            cxt.fillStyle = palette[fgColor];
            cxt.fillText(s, x, y);
          }
          x += charWidth;
        }
      }
      y += charHeight;
      x = 0;
    }
  }, [ width, height, lines, blinked, palette, metrics ]);
  return createElement('canvas', { ref: canvasRef, className: 'AnsiCanvas' });
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
    const charWidth = m.fontBoundingBoxRight - m.fontBoundingBoxLeft;
    metrics = fontMetrics[specifier] = { specifier, charWidth, charHeight, ascent };
  }
  return metrics;
}
/* c8 ignore stop */

async function fetchBuffer(src, options) {
  const res = await fetch(src, options);
  if (res.status !== 200) {
    throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  }
  return await res.arrayBuffer();
}

const cgaPalette = [
  '#000000', '#aa0000', '#00aa00', '#aa5500', '#0000aa', '#aa00aa', '#00aaaa', '#aaaaaa',
  '#555555', '#ff5555', '#55ff55', '#ffff55', '#5555ff', '#ff55ff', '#55ffff', '#ffffff',
];