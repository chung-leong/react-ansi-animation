import { useRoute } from './array-router/index.js';
import { useFocus, useInput, Box } from 'ink';
import { AnsiText } from './react-ansi-animation/ink.js';
import { jsx as _jsx } from "react/jsx-runtime";
export default function AnsiDisplay({
  src,
  onExit,
  onEnd
}) {
  const {
    isFocused
  } = useFocus({
    id: 'main',
    autoFocus: true
  });
  const [parts, options] = useRoute();
  const {
    modemSpeed,
    blinking,
    scrolling,
    transparency
  } = options;
  useInput((input, key) => {
    if (key.escape || key.return || input === ' ') {
      onExit?.(key);
    }
  }, {
    isActive: isFocused
  });
  const borderStyle = 'round';
  const borderColor = isFocused ? 'blue' : undefined;
  const flexDirection = 'column';
  const maxHeight = scrolling ? 24 : 1024;
  const onStatus = status => {
    if (status.position === 1) {
      // played to 100%
      onEnd?.(status);
    }
  };
  return /*#__PURE__*/_jsx(Box, {
    borderStyle,
    borderColor,
    flexDirection,
    children: /*#__PURE__*/_jsx(AnsiText, {
      src,
      modemSpeed,
      blinking,
      maxHeight,
      transparency,
      onStatus
    })
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VSb3V0ZSIsInVzZUZvY3VzIiwidXNlSW5wdXQiLCJCb3giLCJBbnNpVGV4dCIsIkFuc2lEaXNwbGF5Iiwic3JjIiwib25FeGl0Iiwib25FbmQiLCJpc0ZvY3VzZWQiLCJpZCIsImF1dG9Gb2N1cyIsInBhcnRzIiwib3B0aW9ucyIsIm1vZGVtU3BlZWQiLCJibGlua2luZyIsInNjcm9sbGluZyIsInRyYW5zcGFyZW5jeSIsImlucHV0Iiwia2V5IiwiZXNjYXBlIiwicmV0dXJuIiwiaXNBY3RpdmUiLCJib3JkZXJTdHlsZSIsImJvcmRlckNvbG9yIiwidW5kZWZpbmVkIiwiZmxleERpcmVjdGlvbiIsIm1heEhlaWdodCIsIm9uU3RhdHVzIiwic3RhdHVzIiwicG9zaXRpb24iXSwic291cmNlcyI6WyJBbnNpRGlzcGxheS5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlUm91dGUgfSBmcm9tICcuL2FycmF5LXJvdXRlci9pbmRleC5qcyc7XG5pbXBvcnQgeyB1c2VGb2N1cywgdXNlSW5wdXQsIEJveCB9IGZyb20gJ2luayc7XG5pbXBvcnQgeyBBbnNpVGV4dCB9IGZyb20gJy4vcmVhY3QtYW5zaS1hbmltYXRpb24vaW5rLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQW5zaURpc3BsYXkoeyBzcmMsIG9uRXhpdCwgb25FbmQgfSkge1xuICBjb25zdCB7IGlzRm9jdXNlZCB9ID0gdXNlRm9jdXMoeyBpZDogJ21haW4nLCBhdXRvRm9jdXM6IHRydWUgfSk7XG4gIGNvbnN0IFsgcGFydHMsIG9wdGlvbnMgXSA9IHVzZVJvdXRlKCk7XG4gIGNvbnN0IHsgbW9kZW1TcGVlZCwgYmxpbmtpbmcsIHNjcm9sbGluZywgdHJhbnNwYXJlbmN5IH0gPSBvcHRpb25zO1xuICB1c2VJbnB1dCgoaW5wdXQsIGtleSkgPT4ge1xuICAgIGlmIChrZXkuZXNjYXBlIHx8IGtleS5yZXR1cm4gfHwgaW5wdXQgPT09ICcgJykge1xuICAgICAgb25FeGl0Py4oa2V5KTtcbiAgICB9XG4gIH0sIHsgaXNBY3RpdmU6IGlzRm9jdXNlZCB9KVxuICBjb25zdCBib3JkZXJTdHlsZSA9ICdyb3VuZCc7XG4gIGNvbnN0IGJvcmRlckNvbG9yID0gKGlzRm9jdXNlZCkgPyAnYmx1ZScgOiB1bmRlZmluZWQ7XG4gIGNvbnN0IGZsZXhEaXJlY3Rpb24gPSAnY29sdW1uJztcbiAgY29uc3QgbWF4SGVpZ2h0ID0gKHNjcm9sbGluZykgPyAyNCA6IDEwMjQ7XG4gIGNvbnN0IG9uU3RhdHVzID0gKHN0YXR1cykgPT4ge1xuICAgIGlmIChzdGF0dXMucG9zaXRpb24gPT09IDEpIHtcbiAgICAgIC8vIHBsYXllZCB0byAxMDAlXG4gICAgICBvbkVuZD8uKHN0YXR1cyk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gKFxuICAgIDxCb3ggey4uLnsgYm9yZGVyU3R5bGUsIGJvcmRlckNvbG9yLCBmbGV4RGlyZWN0aW9uIH19PlxuICAgICAgPEFuc2lUZXh0IHsuLi57IHNyYywgbW9kZW1TcGVlZCwgYmxpbmtpbmcsIG1heEhlaWdodCwgdHJhbnNwYXJlbmN5LCBvblN0YXR1cyB9fSAvPlxuICAgIDwvQm94PlxuICApO1xufSJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsUUFBUSxRQUFRLHlCQUF5QjtBQUNsRCxTQUFTQyxRQUFRLEVBQUVDLFFBQVEsRUFBRUMsR0FBRyxRQUFRLEtBQUs7QUFDN0MsU0FBU0MsUUFBUSxRQUFRLCtCQUErQjtBQUFDO0FBRXpELGVBQWUsU0FBU0MsV0FBVyxDQUFDO0VBQUVDLEdBQUc7RUFBRUMsTUFBTTtFQUFFQztBQUFNLENBQUMsRUFBRTtFQUMxRCxNQUFNO0lBQUVDO0VBQVUsQ0FBQyxHQUFHUixRQUFRLENBQUM7SUFBRVMsRUFBRSxFQUFFLE1BQU07SUFBRUMsU0FBUyxFQUFFO0VBQUssQ0FBQyxDQUFDO0VBQy9ELE1BQU0sQ0FBRUMsS0FBSyxFQUFFQyxPQUFPLENBQUUsR0FBR2IsUUFBUSxFQUFFO0VBQ3JDLE1BQU07SUFBRWMsVUFBVTtJQUFFQyxRQUFRO0lBQUVDLFNBQVM7SUFBRUM7RUFBYSxDQUFDLEdBQUdKLE9BQU87RUFDakVYLFFBQVEsQ0FBQyxDQUFDZ0IsS0FBSyxFQUFFQyxHQUFHLEtBQUs7SUFDdkIsSUFBSUEsR0FBRyxDQUFDQyxNQUFNLElBQUlELEdBQUcsQ0FBQ0UsTUFBTSxJQUFJSCxLQUFLLEtBQUssR0FBRyxFQUFFO01BQzdDWCxNQUFNLEdBQUdZLEdBQUcsQ0FBQztJQUNmO0VBQ0YsQ0FBQyxFQUFFO0lBQUVHLFFBQVEsRUFBRWI7RUFBVSxDQUFDLENBQUM7RUFDM0IsTUFBTWMsV0FBVyxHQUFHLE9BQU87RUFDM0IsTUFBTUMsV0FBVyxHQUFJZixTQUFTLEdBQUksTUFBTSxHQUFHZ0IsU0FBUztFQUNwRCxNQUFNQyxhQUFhLEdBQUcsUUFBUTtFQUM5QixNQUFNQyxTQUFTLEdBQUlYLFNBQVMsR0FBSSxFQUFFLEdBQUcsSUFBSTtFQUN6QyxNQUFNWSxRQUFRLEdBQUlDLE1BQU0sSUFBSztJQUMzQixJQUFJQSxNQUFNLENBQUNDLFFBQVEsS0FBSyxDQUFDLEVBQUU7TUFDekI7TUFDQXRCLEtBQUssR0FBR3FCLE1BQU0sQ0FBQztJQUNqQjtFQUNGLENBQUM7RUFDRCxvQkFDRSxLQUFDLEdBQUc7SUFBT04sV0FBVztJQUFFQyxXQUFXO0lBQUVFLGFBQWE7SUFBQSx1QkFDaEQsS0FBQyxRQUFRO01BQU9wQixHQUFHO01BQUVRLFVBQVU7TUFBRUMsUUFBUTtNQUFFWSxTQUFTO01BQUVWLFlBQVk7TUFBRVc7SUFBUTtFQUFNLEVBQzlFO0FBRVYifQ==