# AnsiText

## Syntax

## Props

### `src`

Type: `<string>` or `undefined`

### `srcObject`

Type: `<ArrayBuffer>` or `<string>` or `<Promise>` or `undefined`

### `palette `

Type: `<string[16]>` or `"css"`  
Default: [CGA Palette](../src/dos-environment.js#L30)

### `className`

Type: `<string>`  
Default: `"AnsiText"`

### `modemSpeed` 

Type: `<number>`  
Default: `56000`

### `frameDuration`

Type: `<number>`  
Default: `100`

### `blinkDuration`

Type: `<number>`  
Default: `500`

### `blinking` 

Type: `<number>` or `"css"`  
Default: `false`

### `transparency`

Type: `<number>`  
Default: `false`

### `minWidth`

Type: `<number>`  
Default: `79`

### `minHeight` 

Type: `<number>`  
Default: 22

### `maxWidth`

Type: `<number>`  
Default: 80

### `maxHeight`

Type: `<number>`  
Default: 25

### `initialStatus`

Type: `<object>`  
Default: `{ position: 0, playing: true }`

### `beep`

Type: `<Function>` or `undefined`  
Default: `undefined`

### `onStatus`

Type: `<Function>` or `undefined`  
Default: `undefined`

### `onError`

Type: `<Function>` or `undefined`  
Default: `undefined`

### `onMetadata`

Type: `<Function>` or `undefined`  
Default: `undefined`
