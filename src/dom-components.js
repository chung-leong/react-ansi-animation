import { useMemo, useRef, useEffect, createElement } from 'react';
import { useSequentialState } from 'react-seq';
import { useAnsi, toCP437 } from './hooks.js';

export function AnsiText(props) {
  const { 
    src, 
    srcObject, 
    palette = cgaPalette, 
    onStatus,
    onError,
    onMetadata,
    className = 'AnsiText',
    ...options 
  } = props;
  const { data, error } = useData(src, srcObject);
  const { lines, blinked, status, metadata } = useAnsi(data, options);
  useEventHandling(onStatus, status, onMetadata, metadata, onError, error);
  const children = createSpans(lines, blinked, options.blinking, palette);
  return createElement('div', { className }, ...children);
}

function createSpans(lines, blinked, blinking, palette) {
  return lines.map((segments) => {
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
    const style = {
      display: 'block',
      whiteSpace: 'pre', 
      width: 'fit-content',
    };
    return createElement('code', { style }, ...spans);
  });  
}

function useData(src, srcObject) {
  return useSequentialState(async function*({ initial, signal }) {
    if (srcObject) {
      initial({ data: srcObject, error: null });
    } else if (!src) {
      initial({ data: (new Uint8Array(0)).buffer, error: null });
    } else {
      initial({ data: null, error: null });
      let data, error;
      try {
        const res = await fetch(src, { signal });
        if (res.status !== 200) {
          throw new Error(`${res.status} - ${res.statusText}`);
        }
        data = await res.arrayBuffer()        
      } catch (err) {
        data = toCP437(err.message);
        error = err;
      }
      yield { data, error };
    }
  }, [ src, srcObject ]);
}

function useEventHandling(onStatus, status, onMetadata, metadata, onError, error) {
  const handlerRef = useRef();
  handlerRef.current = { onStatus, onMetadata, onError };
  useEffect(() => { handlerRef.current.onStatus?.(status) }, [ status ]);
  useEffect(() => { handlerRef.current.onMetadata?.(metadata) }, [ metadata ]);
  useEffect(() => { handlerRef.current.onError?.(error) }, [ error ]);
}

/* c8 ignore start */
export function AnsiCanvas(props) {
  const { 
    src, 
    srcObject, 
    palette = cgaPalette, 
    onStatus,
    onError,
    onMetadata,
    className = 'AnsiCanvas',
    ...options 
  } = props;
  const { data, error } = useData(src, srcObject);
  const { lines, blinked, status, metadata } = useAnsi(data, options);
  useEventHandling(onStatus, status, onMetadata, metadata, onError, error);
  const children = useMemo(() => {
    return createSpans(lines, blinked, options.blinking, palette);
  }, [ lines, blinked, options.blinking, palette ]);
  return useSequentialState(async function*({ initial, manageEvents, signal }) {
    const [ on, eventual ] = manageEvents();
    const ref = on.canvas.filter(n => n ?? undefined);
    initial(createElement('canvas', { ref, className }, children));
    // wait for canvas to show up
    const { canvas } = await eventual.canvas;
    for (;;) {
      const { fontFamily, fontStyle, fontWeight, fontSize } = getComputedStyle(canvas);
      const specifier = `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
      const { charWidth, charHeight, ascent } = getFontMetrics(specifier);
      const height = canvas.childElementCount;
      const width = [ ...canvas.firstChild.children ].reduce((len, el) => len + el.firstChild.nodeValue.length, 0);
      canvas.width = width * charWidth;
      canvas.height = height * charHeight;
      const cxt = canvas.getContext('2d');
      cxt.font = specifier;    
      let x = 0, y = ascent;
      for (const code of canvas.children) {
        for (const span of code.children) {
          const { color, backgroundColor } = getComputedStyle(span);
          const drawBG = (backgroundColor !== 'transparent');
          const drawFG = (color !== 'transparent');
          const text = span.firstChild.nodeValue;
          for (let i = 0; i < text.length; i++) {
            if (drawBG) {
              cxt.fillStyle = backgroundColor;
              cxt.fillText('\u2588', x, y);
            }
            if (drawFG) {
              cxt.fillStyle = color;
              cxt.fillText(text.charAt(i), x, y);
            }
            x += charWidth;
          }
        }
        y += charHeight;
        x = 0;
      }
      break;
    }
    yield createElement('canvas', { className });
  }, [ children, className ]);
}

const fontMetrics = {};

function getFontMetrics(specifier) {
  let metrics = fontMetrics[specifier];
  if (!metrics) {
    const canvas = document.createElement('CANVAS');
    const cxt = canvas.getContext('2d');
    cxt.font = specifier;
    const m = cxt.measureText('\u2588');
    metrics = fontMetrics[specifier] = { 
      ascent: m.fontBoundingBoxAscent,
      charHeight: m.fontBoundingBoxAscent + m.fontBoundingBoxDescent,
      charWidth: m.width,
    };
  }
  return metrics;
}
/* c8 ignore stop */

const cgaPalette = [
  '#000000', '#aa0000', '#00aa00', '#aa5500', '#0000aa', '#aa00aa', '#00aaaa', '#aaaaaa',
  '#555555', '#ff5555', '#55ff55', '#ffff55', '#5555ff', '#ff55ff', '#55ffff', '#ffffff',
];