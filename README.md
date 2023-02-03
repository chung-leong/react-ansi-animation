# React-ansi-animation ![ci](https://img.shields.io/github/actions/workflow/status/chung-leong/react-ansi-animation/node.js.yml?branch=main&label=Node.js%20CI&logo=github) ![nycrc config on GitHub](https://img.shields.io/nycrc/chung-leong/react-ansi-animation)

React-ansi-animation is React library that provides a set of components for displaying ANSI art. 
It can render either HTML text elements or into a canvas. It can also output text for 
[Ink](https://github.com/vadimdemedes/ink)-based CLI applications. The library is designed for 
React 18 and above.

## Basic usage

```js
import { AnsiText } from 'react-ansi-animation';

export default function App() {
  return <AnsiText src="./test.ans" modemSpeed={9600} />;
}
```

## Features

* Embedded font support
* Modem speed emulation
* Blinking text
* Animation playback ctronol

## Components

* [`<AnsiText />`](./docs/AnsiText.md)
* [`<AnsiCanvas />`](./docs/AnsiCanvas.md)

## Hooks

* [`useAnsi`](./docs/useAnsi.md)

## Customizing text appearance

AnsiText returns an HTML element with the following structure:

```html
  <div className="AnsiText">
    <code style="display: block; whiteSpace: pre; width: fit-content">
      <span style="color: [color]; background-color: [color]">[ text ]</span>
      <span />
        ⋮
      <span />
    </code>
    <code />
      ⋮
    <code />
  </div>
```

To change the font size, weight, and other attributes, simply add a rule to your CSS file:

```css
div.AnsiText {
  font-size: 24px;
  font-weight: bold;
}
```

