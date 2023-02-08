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

[`<AnsiText>`](./docs/AnsiText.md) creates `<code>` HTML element, which employs the "monotype" font
by default. It will have the `className` "AnsiText". To change the font size, weight, and other 
attributes, simply add a rule to your CSS file:

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

You can change the color palette by providing the [`palette`](./docs/AnsiText.md#palette) prop. To
define colors through CSS instead, set `palette` to `"css"`. See documentation for more details.

## Modem speed emulation

By default this library emulates a 56K modem. Set the [`modemSpeed`] prop to use a different speed.
Use `Infinity` if you want the final picture to appear immediately.

## Blinking text

The CGA 80x25 text mode uses 4 bits to store the text color (16 possible values), 3 bites to store
the background color (8 possible values), and 1 bit for blinking. ANSI arts created in the BBS 
era sometimes depends on blinking for certain effects. ANSI arts created in later times tend to 
use the final bit for high-intensity background colors. They would look odd when viewed in CGA
text mode.

Blinking is disabled by default. Set the [`blinking`] prop to enable it.

## Animation playback control

By providing an [`onStatus`](./AnsiText.md#onstatus) handler and altering the 
[`initialStatus`](./AnsiText.md#initialstatus) prop, you can pause the animation or jump to 
different points in time. [Code for the demo](./demo/dom/App.js) serves as a good working example.

## Acknowledgement

Special thanks to the maintainers of [ansi-bbs.org](http://www.ansi-bbs.org/) for providing a 
detailed [ANSI specification](http://www.ansi-bbs.org/) and the maintainers of 
[Sixteen Colors](https://16colo.rs/), the source of most of the ANSI arts used in the demo.

