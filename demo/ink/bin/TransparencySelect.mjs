import { useRoute } from './array-router/index.js';
import SelectBox from "./BooleanSelectBox.mjs";
import { jsx as _jsx } from "react/jsx-runtime";
export default function TransparencySelect() {
  const [parts, options] = useRoute();
  const id = 'transparency';
  const label = '&Transparency';
  const items = [{
    label: 'on',
    value: true
  }, {
    label: 'off',
    value: false
  }];
  const value = options.transparency;
  const home = 'main';
  const onSelect = ({
    value
  }) => options.transparency = value;
  return /*#__PURE__*/_jsx(SelectBox, {
    id,
    label,
    items,
    value,
    home,
    onSelect
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VSb3V0ZSIsIlNlbGVjdEJveCIsIlRyYW5zcGFyZW5jeVNlbGVjdCIsInBhcnRzIiwib3B0aW9ucyIsImlkIiwibGFiZWwiLCJpdGVtcyIsInZhbHVlIiwidHJhbnNwYXJlbmN5IiwiaG9tZSIsIm9uU2VsZWN0Il0sInNvdXJjZXMiOlsiVHJhbnNwYXJlbmN5U2VsZWN0LmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VSb3V0ZSB9IGZyb20gJy4vYXJyYXktcm91dGVyL2luZGV4LmpzJztcbmltcG9ydCBTZWxlY3RCb3ggZnJvbSBcIi4vQm9vbGVhblNlbGVjdEJveC5qc3hcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVHJhbnNwYXJlbmN5U2VsZWN0KCkge1xuICBjb25zdCBbIHBhcnRzLCBvcHRpb25zIF0gPSB1c2VSb3V0ZSgpO1xuICBjb25zdCBpZCA9ICd0cmFuc3BhcmVuY3knO1xuICBjb25zdCBsYWJlbCA9ICcmVHJhbnNwYXJlbmN5JztcbiAgY29uc3QgaXRlbXMgPSBbXG4gICAgeyBsYWJlbDogJ29uJywgdmFsdWU6IHRydWUgfSxcbiAgICB7IGxhYmVsOiAnb2ZmJywgdmFsdWU6IGZhbHNlIH0sXG4gIF07XG4gIGNvbnN0IHZhbHVlID0gb3B0aW9ucy50cmFuc3BhcmVuY3k7XG4gIGNvbnN0IGhvbWUgPSAnbWFpbic7XG4gIGNvbnN0IG9uU2VsZWN0ID0gKHsgdmFsdWUgfSkgPT4gb3B0aW9ucy50cmFuc3BhcmVuY3kgPSB2YWx1ZTtcbiAgcmV0dXJuIDxTZWxlY3RCb3ggey4uLnsgaWQsIGxhYmVsLCBpdGVtcywgdmFsdWUsIGhvbWUsIG9uU2VsZWN0IH19IC8+O1xufSJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsUUFBUSxRQUFRLHlCQUF5QjtBQUNsRCxPQUFPQyxTQUFTO0FBQStCO0FBRS9DLGVBQWUsU0FBU0Msa0JBQWtCLEdBQUc7RUFDM0MsTUFBTSxDQUFFQyxLQUFLLEVBQUVDLE9BQU8sQ0FBRSxHQUFHSixRQUFRLEVBQUU7RUFDckMsTUFBTUssRUFBRSxHQUFHLGNBQWM7RUFDekIsTUFBTUMsS0FBSyxHQUFHLGVBQWU7RUFDN0IsTUFBTUMsS0FBSyxHQUFHLENBQ1o7SUFBRUQsS0FBSyxFQUFFLElBQUk7SUFBRUUsS0FBSyxFQUFFO0VBQUssQ0FBQyxFQUM1QjtJQUFFRixLQUFLLEVBQUUsS0FBSztJQUFFRSxLQUFLLEVBQUU7RUFBTSxDQUFDLENBQy9CO0VBQ0QsTUFBTUEsS0FBSyxHQUFHSixPQUFPLENBQUNLLFlBQVk7RUFDbEMsTUFBTUMsSUFBSSxHQUFHLE1BQU07RUFDbkIsTUFBTUMsUUFBUSxHQUFHLENBQUM7SUFBRUg7RUFBTSxDQUFDLEtBQUtKLE9BQU8sQ0FBQ0ssWUFBWSxHQUFHRCxLQUFLO0VBQzVELG9CQUFPLEtBQUMsU0FBUztJQUFPSCxFQUFFO0lBQUVDLEtBQUs7SUFBRUMsS0FBSztJQUFFQyxLQUFLO0lBQUVFLElBQUk7SUFBRUM7RUFBUSxFQUFNO0FBQ3ZFIn0=