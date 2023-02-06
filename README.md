# React-ansi-animation ![ci](https://img.shields.io/github/actions/workflow/status/chung-leong/react-ansi-animation/node.js.yml?branch=main&label=Node.js%20CI&logo=github) ![nycrc config on GitHub](https://img.shields.io/nycrc/chung-leong/react-ansi-animation)

React-ansi-animation is React library that provides a set of components for displaying ANSI art. 
It can render either HTML text elements or into a canvas. It can also output text for 
[Ink](https://github.com/vadimdemedes/ink)-based CLI applications. The library is designed for 
React 18 and above.

## Basic usage

```js
import { AnsiText } from 'react-ansi-animation';

export default function Widget() {
  return <AnsiText src="./test.ans" modemSpeed={9600} />;
}
```

## Features

* [Embedded font support](#customizing-text-appearance)
* [Modem speed emulation](#modem-speed-emulation)
* [Blinking text](#blinking-text)
* [Animation playback control](#animation-playback-control)

## Demo

## Components

* [`<AnsiText>`](./docs/AnsiText.md)
* [`<AnsiCanvas>`](./docs/AnsiCanvas.md)

## Hooks

* [`useAnsi`](./docs/useAnsi.md)

## Customizing text appearance

[`<AnsiText>`](./docs/AnsiText.md) renders an HTML element with the following structure:

```html
  <code className="AnsiText" style="display: inline-block; whiteSpace: pre; width: fit-content">
    <div>
      <span style="color: [color]; background-color: [color]">[ text ]</span>
      <span />
        ⋮
      <span />
    </div>
    <div />
      ⋮
    <div />
  </code>
```

`<code>` employs the "monotype" font by default. To change the font size, weight, and other attributes, 
simply add a rule to your CSS file:

```css
.AnsiText {
  font-family: 'Courier New', monotype;
  font-size: 24px;
  font-weight: bold;
}
```

You can change the font used by [`<AnsiCanvas>`](./docs/AnsiCanvas.md) in the same manner:

```css
.AnsiCanvas {
  font-family: 'Courier New', monotype;
  font-size: 24px;
  font-weight: bold;
}
```

Use a `@font-face` declaration if you wish to use a custom font:

```css
@font-face {
  font-family: 'Flexi IBM VGA';
  font-style: normal;
  font-weight: normal;
  src: url('/fonts/flexi-ibm-vga-true-437.woff2') format('woff2'),
       url('/fonts/flexi-ibm-vga-true-437.woff') format('woff');
}
```

You can change the color palette by providing the [`palette`](./docs/AnsiText.md#palette) prop. To define colors
through CSS instead, set `palette` to `"css"`. See documentation for more details.

## Modem speed emulation


## Blinking text



## Animation playback control


## Acknowledgement

