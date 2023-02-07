# useAnsi(dataSource, [options])

## Syntax

```js
  const { lines, blinking, blinked } = useAnsi(data, options);
```

## Parameters

* `dataSource` - `<ArrayBuffer>` or `<string>` or `<Promise>` Buffer containing data from an ANSI file
* `options` - `<Object>`
* `return` `<Object>`

## Options

## Return value properties

* `width` - `<number>` The number of columns
* `height` - `<number>` The number of rows
* `lines` - `<Object[][]>` Objects describing text segments on each row
* `blinking` - `<boolean>` or `<string>` 
* `blinked` - `<boolean>` Whether blinking text should be invisible
* `willBlink` - `<boolean>` Whether there are any blinking text segments
* `status` - `{ position: <number>, playing: <boolean> }` Current status of animation
* `metadata` - `<string[]>` Metadata stored at the end of file
* `error` - `<Error>` Data retrieval error

## Notes