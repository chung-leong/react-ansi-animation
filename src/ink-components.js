import { readFile } from 'fs/promises';
import { useMemo, createElement, Fragment } from 'react';
import { Text } from 'ink';
import { useAnsi } from './hooks.js';

export function AnsiText({ src, srcObject, palette = cgaPalette, ...options }) {
  const dataSource = useMemo(() => getDataSource(src, srcObject), [ src, srcObject ]);
  const { lines, blinked } = useAnsi(dataSource, options);
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

function getDataSource(src, srcObject) {
  if (srcObject) {
    return srcObject;
  }
  if (src) {
    return readFile(src);
  } else {
    return Buffer.alloc(0);
  }
}

const cgaPalette = [
  '#000000', '#aa0000', '#00aa00', '#aa5500', '#0000aa', '#aa00aa', '#00aaaa', '#aaaaaa',
  '#555555', '#ff5555', '#55ff55', '#ffff55', '#5555ff', '#ff55ff', '#55ffff', '#ffffff',
];