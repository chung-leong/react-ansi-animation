# useAnsi(dataSource, [options])

Hook for decoding text with ANSI escape sequences. 

## Syntax

```js
  const { lines, blinking, blinked } = useAnsi(data, options);
```

## Parameters

* `dataSource` - `<ArrayBuffer>` or `<string>` or `<Promise>` Buffer containing data from an ANSI file
* `options` - `<Object>`
* `return` `<Object>`

## Options

* [`modemSpeed`](./AnsiText.md#modemspeed)
* [`frameDuration`](./AnsiText.md#frameduration)
* [`blinkDuration`](./AnsiText.md#blinkduration)  
* [`blinking`](./AnsiText.md#blinking)
* [`transparency`](./AnsiText.md#transparency)
* [`minWidth`](./AnsiText.md#minwidth)
* [`minHeight`](./AnsiText.md#minheight)
* [`maxWidth`](./AnsiText.md#maxwidth)
* [`maxHeight`](./AnsiText.md#maxheight)
* [`initialStatus`](./AnsiText.md#initialstatus)
* [`onStatus`](./AnsiText.md#onstatus)
* [`onError`](./AnsiText.md#onerror)
* [`onMetadata`](./AnsiText.md#onmetadata)
* [`beep`](./AnsiText.md#beep)

## Return value properties

* `width` - `<number>` The number of columns
* `height` - `<number>` The number of rows
* `lines` - `<Object[][]>` Objects describing text segments on each row
* `blinking` - `<boolean>` or `<string>` Value given in `options`
* `blinked` - `<boolean>` Whether blinking text should be invisible at the current moment
* `willBlink` - `<boolean>` Whether there are any blinking text segments
* `status` - `{ position: <number>, playing: <boolean> }` Current status of animation
* `metadata` - `<string[]>` Metadata stored at the end of file
* `error` - `<Error>` Data retrieval error

## Text segment properties

* `text` - `<string>` Text contained in the segment
* `fgColor` - `<number>` A number between 0 and 15 representing one of the CGA colors
* `bgColor` - `<number>` A number between 0 and 15 (or 7 if `blinking` is true) representing one of
the CGA colors
* `blink` - `<boolean>` Whether the text should blink

## Notes

If `dataSource` is a promise, the hook will await it, returning in the meantime a blank
screen. The result will be cached in a WeakMap. When the hook encounters the same 
promise later, it'll obtain the result immediately.

If `dataSource` is a string, it'll be converted into CP-437 (DOS) encoding. Characters 
outside the codepage will appear as ?.

