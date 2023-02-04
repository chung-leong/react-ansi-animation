import { useMemo, createElement, Fragment } from 'react';
import { useAnsi } from './hooks.js';
import { readFile } from 'fs/promises';
import { Text } from 'ink';

export function AnsiText({ src, srcObject, palette = cgaPalette, ...options }) {
  // retrieve data if necessary
  const data = useMemo(() => {
    if (srcObject) {
      return srcObject;
    } else if (src) {
      return readFile(src);
    } else {
      return new Buffer.alloc(0);
    }
  }, [ src, srcObject ]);
  const { lines, blinked } = useAnsi(data, options);
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