import { useMemo, useRef, useEffect, createElement } from 'react';
import { useSequentialState } from 'react-seq';
import { useAnsi } from './hooks.js';

export function AnsiText({ src, srcObject, palette = cgaPalette, ...options }) {
  const dataSource = useMemo(() => getDataSource(src, srcObject), [ src, srcObject ]);
  const { lines, blinked } = useAnsi(dataSource, options);
  const children = lines.map((segments, i) => {
    const spans = segments.map(({ text, fgColor, bgColor, blink, transparent }, j) => {
      const style = {
        backgroundColor: (transparent) ? undefined : palette[bgColor],
        color: palette[(blink && blinked) ? bgColor : fgColor],
      };
      return createElement('span', { key: j, style }, text);
    });
    const style = {
      whiteSpace: 'pre', 
      width: 'fit-content',
    };
    return createElement('div', { key: i, style }, spans);
  });
  return createElement('code', { className: 'AnsiText' }, children);
}

export function AnsiCanvas({ src, srcObject, palette = cgaPalette, font = {}, ...options }) {
  const { 
    family = 'monospace',
    style = 'normal', 
    weight = 'normal',
    size = '12px',
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
    const cxt = canvas.getContext('2d');
    let row = 0, col = 0;
    for (const line of lines) {
      for (const { text, bgColor, fgColor, blink, transparent } of line) {
        const x = col * charWidth, y = row * charHeight;
        cxt.fillStyle = (transparent) ? 'rgba(0,0,0,0)' : palette[bgColor];
        cxt.fillRect(x, y, charWidth * text.length, charHeight);
        if (!transparent && (!blink || !blinked)) {
          cxt.fillStyle = palette[fgColor];
          cxt.font = specifier;
          cxt.fillText(text, x, y + ascent);
        }
        col += text.length;
      }
      row++;
      col = 0;
    }
  }, [ width, height, lines, blinked, palette, metrics ]);
  return createElement('canvas', { ref: canvasRef, className: 'AnsiCanvas' });
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

const cgaPalette = [
  '#000000', '#aa0000', '#00aa00', '#aa5500', '#0000aa', '#aa00aa', '#00aaaa', '#aaaaaa',
  '#555555', '#ff5555', '#55ff55', '#ffff55', '#5555ff', '#ff55ff', '#55ffff', '#ffffff',
];