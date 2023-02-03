import { useRef, useMemo, useEffect, createElement, Fragment } from 'react';
import { useSequentialState } from 'react-seq';
import { useAnsi, toCP437 } from './hooks.js';
import { readFile } from 'fs/promises';
import { Text } from 'ink';

export function AnsiText(props) {
  const { 
    src, 
    srcObject, 
    palette = cgaPalette, 
    onStatus,
    onError,
    onMetadata,
    ...options 
  } = props;
  // retrieve data
  const { data, error } = useSequentialState(async function*({ initial }) {      
    let data = null, error = null, promise = null;
    if (srcObject) {
      if (typeof(srcObject.then) === 'function') {
        promise = srcObject;
      } else {
        data = srcObject;
      }
    } else if (src) {
      promise = readFile(src);
    } else {
      data = new Buffer.alloc(0);
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
  const { lines, blinked, status, metadata } = useAnsi(data, options);
  // relay events
  const handlerRef = useRef();
  handlerRef.current = { onStatus, onMetadata, onError };
  useEffect(() => { handlerRef.current.onStatus?.(status) }, [ status ]);
  useEffect(() => { handlerRef.current.onMetadata?.(metadata) }, [ metadata ]);
  useEffect(() => { handlerRef.current.onError?.(error) }, [ error ]);
  // convert lines to Ink Text elements
  const children = lines.map((segments) => {
    const spans = segments.map(({ text, fgColor, bgColor, blink, transparent }) => {
      const props = {
        backgroundColor: (transparent) ? undefined : palette[bgColor],
        color: palette[(blink && blinked) ? bgColor : fgColor],
      };
      return createElement(Text, props, text);
    });
    return createElement(Text, {}, ...spans);
  });
  return createElement(Fragment, {}, ...children);
}

const cgaPalette = [
  '#000000', '#aa0000', '#00aa00', '#aa5500', '#0000aa', '#aa00aa', '#00aaaa', '#aaaaaa',
  '#555555', '#ff5555', '#55ff55', '#ffff55', '#5555ff', '#ff55ff', '#55ffff', '#ffffff',
];