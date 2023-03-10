import { useRoute } from 'array-router';
import { useFocus, useInput, Box } from 'ink';
import { AnsiText } from 'react-ansi-animation/ink';
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
  const maxHeight = scrolling ? 25 : 1024;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VSb3V0ZSIsInVzZUZvY3VzIiwidXNlSW5wdXQiLCJCb3giLCJBbnNpVGV4dCIsIkFuc2lEaXNwbGF5Iiwic3JjIiwib25FeGl0Iiwib25FbmQiLCJpc0ZvY3VzZWQiLCJpZCIsImF1dG9Gb2N1cyIsInBhcnRzIiwib3B0aW9ucyIsIm1vZGVtU3BlZWQiLCJibGlua2luZyIsInNjcm9sbGluZyIsInRyYW5zcGFyZW5jeSIsImlucHV0Iiwia2V5IiwiZXNjYXBlIiwicmV0dXJuIiwiaXNBY3RpdmUiLCJib3JkZXJTdHlsZSIsImJvcmRlckNvbG9yIiwidW5kZWZpbmVkIiwiZmxleERpcmVjdGlvbiIsIm1heEhlaWdodCIsIm9uU3RhdHVzIiwic3RhdHVzIiwicG9zaXRpb24iXSwic291cmNlcyI6WyJBbnNpRGlzcGxheS5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlUm91dGUgfSBmcm9tICdhcnJheS1yb3V0ZXInO1xuaW1wb3J0IHsgdXNlRm9jdXMsIHVzZUlucHV0LCBCb3ggfSBmcm9tICdpbmsnO1xuaW1wb3J0IHsgQW5zaVRleHQgfSBmcm9tICdyZWFjdC1hbnNpLWFuaW1hdGlvbi9pbmsnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBbnNpRGlzcGxheSh7IHNyYywgb25FeGl0LCBvbkVuZCB9KSB7XG4gIGNvbnN0IHsgaXNGb2N1c2VkIH0gPSB1c2VGb2N1cyh7IGlkOiAnbWFpbicsIGF1dG9Gb2N1czogdHJ1ZSB9KTtcbiAgY29uc3QgWyBwYXJ0cywgb3B0aW9ucyBdID0gdXNlUm91dGUoKTtcbiAgY29uc3QgeyBtb2RlbVNwZWVkLCBibGlua2luZywgc2Nyb2xsaW5nLCB0cmFuc3BhcmVuY3kgfSA9IG9wdGlvbnM7XG4gIHVzZUlucHV0KChpbnB1dCwga2V5KSA9PiB7XG4gICAgaWYgKGtleS5lc2NhcGUgfHwga2V5LnJldHVybiB8fCBpbnB1dCA9PT0gJyAnKSB7XG4gICAgICBvbkV4aXQ/LihrZXkpO1xuICAgIH1cbiAgfSwgeyBpc0FjdGl2ZTogaXNGb2N1c2VkIH0pXG4gIGNvbnN0IGJvcmRlclN0eWxlID0gJ3JvdW5kJztcbiAgY29uc3QgYm9yZGVyQ29sb3IgPSAoaXNGb2N1c2VkKSA/ICdibHVlJyA6IHVuZGVmaW5lZDtcbiAgY29uc3QgZmxleERpcmVjdGlvbiA9ICdjb2x1bW4nO1xuICBjb25zdCBtYXhIZWlnaHQgPSAoc2Nyb2xsaW5nKSA/IDI1IDogMTAyNDtcbiAgY29uc3Qgb25TdGF0dXMgPSAoc3RhdHVzKSA9PiB7XG4gICAgaWYgKHN0YXR1cy5wb3NpdGlvbiA9PT0gMSkge1xuICAgICAgLy8gcGxheWVkIHRvIDEwMCVcbiAgICAgIG9uRW5kPy4oc3RhdHVzKTtcbiAgICB9XG4gIH07XG4gIHJldHVybiAoXG4gICAgPEJveCB7Li4ueyBib3JkZXJTdHlsZSwgYm9yZGVyQ29sb3IsIGZsZXhEaXJlY3Rpb24gfX0+XG4gICAgICA8QW5zaVRleHQgey4uLnsgc3JjLCBtb2RlbVNwZWVkLCBibGlua2luZywgbWF4SGVpZ2h0LCB0cmFuc3BhcmVuY3ksIG9uU3RhdHVzIH19IC8+XG4gICAgPC9Cb3g+XG4gICk7XG59Il0sIm1hcHBpbmdzIjoiQUFBQSxTQUFTQSxRQUFRLFFBQVEsY0FBYztBQUN2QyxTQUFTQyxRQUFRLEVBQUVDLFFBQVEsRUFBRUMsR0FBRyxRQUFRLEtBQUs7QUFDN0MsU0FBU0MsUUFBUSxRQUFRLDBCQUEwQjtBQUFDO0FBRXBELGVBQWUsU0FBU0MsV0FBVyxDQUFDO0VBQUVDLEdBQUc7RUFBRUMsTUFBTTtFQUFFQztBQUFNLENBQUMsRUFBRTtFQUMxRCxNQUFNO0lBQUVDO0VBQVUsQ0FBQyxHQUFHUixRQUFRLENBQUM7SUFBRVMsRUFBRSxFQUFFLE1BQU07SUFBRUMsU0FBUyxFQUFFO0VBQUssQ0FBQyxDQUFDO0VBQy9ELE1BQU0sQ0FBRUMsS0FBSyxFQUFFQyxPQUFPLENBQUUsR0FBR2IsUUFBUSxFQUFFO0VBQ3JDLE1BQU07SUFBRWMsVUFBVTtJQUFFQyxRQUFRO0lBQUVDLFNBQVM7SUFBRUM7RUFBYSxDQUFDLEdBQUdKLE9BQU87RUFDakVYLFFBQVEsQ0FBQyxDQUFDZ0IsS0FBSyxFQUFFQyxHQUFHLEtBQUs7SUFDdkIsSUFBSUEsR0FBRyxDQUFDQyxNQUFNLElBQUlELEdBQUcsQ0FBQ0UsTUFBTSxJQUFJSCxLQUFLLEtBQUssR0FBRyxFQUFFO01BQzdDWCxNQUFNLEdBQUdZLEdBQUcsQ0FBQztJQUNmO0VBQ0YsQ0FBQyxFQUFFO0lBQUVHLFFBQVEsRUFBRWI7RUFBVSxDQUFDLENBQUM7RUFDM0IsTUFBTWMsV0FBVyxHQUFHLE9BQU87RUFDM0IsTUFBTUMsV0FBVyxHQUFJZixTQUFTLEdBQUksTUFBTSxHQUFHZ0IsU0FBUztFQUNwRCxNQUFNQyxhQUFhLEdBQUcsUUFBUTtFQUM5QixNQUFNQyxTQUFTLEdBQUlYLFNBQVMsR0FBSSxFQUFFLEdBQUcsSUFBSTtFQUN6QyxNQUFNWSxRQUFRLEdBQUlDLE1BQU0sSUFBSztJQUMzQixJQUFJQSxNQUFNLENBQUNDLFFBQVEsS0FBSyxDQUFDLEVBQUU7TUFDekI7TUFDQXRCLEtBQUssR0FBR3FCLE1BQU0sQ0FBQztJQUNqQjtFQUNGLENBQUM7RUFDRCxvQkFDRSxLQUFDLEdBQUc7SUFBT04sV0FBVztJQUFFQyxXQUFXO0lBQUVFLGFBQWE7SUFBQSx1QkFDaEQsS0FBQyxRQUFRO01BQU9wQixHQUFHO01BQUVRLFVBQVU7TUFBRUMsUUFBUTtNQUFFWSxTQUFTO01BQUVWLFlBQVk7TUFBRVc7SUFBUTtFQUFNLEVBQzlFO0FBRVYifQ==