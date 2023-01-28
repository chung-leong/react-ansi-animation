import { useMemo, useRef, useEffect, createElement } from 'react';
import { useSequentialState } from 'react-seq';
import { useAnsi } from './hooks.js';

export function AnsiText({ src, srcObject, palette = cgaPalette, ...options }) {
  const dataSource = useMemo(() => getDataSource(src, srcObject), [ src, srcObject ]);
  const { lines, blinked } = useAnsi(dataSource, options);
  const children = lines.map((segments) => {
    const spans = segments.map(({ text, fgColor, bgColor, blink, transparent }) => {
      const style = {
        backgroundColor: (transparent) ? undefined : palette[bgColor],
        color: palette[(blink && blinked) ? bgColor : fgColor],
      };
      return createElement('span', { style }, text);
    });
    const style = {
      whiteSpace: 'pre', 
      width: 'fit-content',
      clear: 'both'
    };
    return createElement('div', { style }, ...spans);
  });
  return createElement('code', { className: 'AnsiText' }, ...children);
}

function getDataSource(src, srcObject) {
  if (srcObject) {
    return srcObject;
  }
  if (src) {
    return (async () => {
      const res = await fetch(src);
      if (res.status !== 200) {
        throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      }
      return res.arrayBuffer();
    })();
  } else {
    return (new Uint8Array(0)).buffer;
  }
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
  const canvasRef = useRef();
  const dataSource = useMemo(() => getDataSource(src, srcObject), [ src, srcObject ]);
  const { width, height, lines, blinked } = useAnsi(dataSource, options);
  const metrics = useSequentialState(async function*({ initial, mount }) {
    if (isFontLoaded(fontSrc)) {
      initial(getFontMetrics(family, style, weight, size));     
    } else {
      await mount();
      try {
        await loadFont(family, style, weight, fontSrc);
        yield getFontMetrics(family, style, weight, size);
      } catch (err) {
        yield getFontMetrics('monospace', style, weight, size);
      }
    }
  }, [ family, style, weight, size, fontSrc ]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!metrics || !canvas) {
      return;
    }
    const { charWidth, charHeight, ascent, specifier } = metrics;
    canvas.width = width * charWidth;
    canvas.height = height * charHeight;
    canvas.style.aspectRatio = `${width * 8} / ${height * 16}`;
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

function getFontMetrics(family, style, weight, size) {
  const specifier = `${style} ${weight} ${size} ${family}`;
  let metrics = fontMetrics[specifier];
  if (!metrics) {
    const canvas = document.createElement('CANVAS');
    const cxt = canvas.getContext('2d');
    cxt.font = specifier;
    const m = cxt.measureText('\u2588');
    const ascent = m.actualBoundingBoxAscent;
    const charHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const charWidth = m.actualBoundingBoxRight - m.actualBoundingBoxLeft;
    metrics = fontMetrics[specifier] = { specifier, charWidth, charHeight, ascent };
  }
  return metrics;
}

const fontPromises = {};
const fontLoaded = {};

function isFontLoaded(src) {
  return !src || fontLoaded[src];
}

async function loadFont(family, style, weight, src) {
  let promise = fontPromises[src];
  if (!promise) {
    promise = fontPromises[src] = (async () => {
      const fontFace = new FontFace(family, src, { style, weight, display: 'block' });
      await fontFace.load();
      document.fonts.add(fontFace);
      fontLoaded[src] = true;
      return;
    })();
  }
  return promise;
}
/* c8 ignore stop */

const cgaPalette = [
  '#000000', '#aa0000', '#00aa00', '#aa5500', '#0000aa', '#aa00aa', '#00aaaa', '#aaaaaa',
  '#555555', '#ff5555', '#55ff55', '#ffff55', '#5555ff', '#ff55ff', '#55ffff', '#ffffff',
];