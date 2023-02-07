# &lt;AnsiCanvas&gt;

React component that renders an ANSI animation into a `<canvas>`. It's useful in situations where 
arbituary scaling is desired.

## Syntax

```js
  return (
    <div>
      <AnsiCanvas src="./ansi/hello-world.ansi" modemSpeed={2400} />
    </div>
  );
```

## Props

`<AnsiCanvas>` has the same props as [`<AnsiText>`](./AnsiText.md), except the default value for `className` is `"AnsiCanvas"`.
