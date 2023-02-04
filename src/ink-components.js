import { readFile } from 'fs/promises';
import { useMemo, createElement, Fragment } from 'react';
import { useAnsi } from './hooks.js';
import { Text } from 'ink';
import { cgaPalette } from './dos-environment.js';

export function AnsiText({ src, srcObject, palette = cgaPalette, ...options }) {
  // retrieve data if necessary
  const data = useMemo(() => srcObject ?? fetchBuffer(src), [ src, srcObject ]);
  // process data through hook
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

async function fetchBuffer(src) {
  if (src) {
    return readFile(src);
  }
}
