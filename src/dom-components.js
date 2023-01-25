import { useMemo, createElement } from 'react';
import { useAnsi } from './hooks.js';

export function AnsiText({ src, srcObject, palette = cgaPalette, ...options }) {
  const dataSource = useMemo(() => getDataSource(src, srcObject), [ src, srcObject ]);
  const { lines, blinked } = useAnsi(dataSource, options);
  const children = lines.map((segments, i) => {
    const spans = segments.map(({ text, fgColor, bgColor, blink }, j) => {
      const style = {
        backgroundColor: palette[bgColor],
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

const cgaPalette = [
  '#000000', '#aa0000', '#00aa00', '#aa5500', '#0000aa', '#aa00aa', '#00aaaa', '#aaaaaa',
  '#555555', '#ff5555', '#55ff55', '#ffff55', '#5555ff', '#ff55ff', '#55ffff', '#ffffff',
];