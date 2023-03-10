# &lt;AnsiCanvas&gt;

React component that renders an ANSI animation into a `<canvas>`. It's useful in situations where 
arbituary scaling is desired.

## Syntax

```js
  return (
    <div>
      <AnsiCanvas src="./ansi/hello-world.ans" modemSpeed={2400} />
    </div>
  );
```

## Props

`<AnsiCanvas>` has the same props as [`<AnsiText>`](./AnsiText.md), except the default value for `className` is `"AnsiCanvas"`.

## Notes

You can change the appearance of text in the canvas by defining a CSS rule for the class "AnsiCanvas". The component will update itself to reflect subsequent style change when there is a
change in its size. 
