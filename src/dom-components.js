import { useRef, useEffect, createElement } from 'react';
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
  // retrieve data
  const { data, error } = useSequentialState(async function*({ initial, signal }) {
    let data = null, error = null, promise = null;
    if (srcObject) {
      if (typeof(srcObject.then) === 'function') {
        promise = srcObject;
      } else {
        data = srcObject;
      }
    } else if (src) {
      promise = fetchBuffer(src, { signal });
    } else {
      data = new Uint8Array(0).buffer;
    }
    initial({ data, error });
    if (promise) {
      try {
        data = await promise;
      } catch (err) {
        data = toCP437(err.message);
        error = err;
      }
      yield { data, error }; 
    }
  }, [ src, srcObject ]);
  // process data through hook
  const { lines, blinked, status, metadata } = useAnsi(data, options);
  // relay events
  const handlerRef = useRef();
  handlerRef.current = { onStatus, onMetadata, onError };
  useEffect(() => { handlerRef.current.onStatus?.(status) }, [ status ]);
  useEffect(() => { handlerRef.current.onMetadata?.(metadata) }, [ metadata ]);
  useEffect(() => { handlerRef.current.onError?.(error) }, [ error ]);
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