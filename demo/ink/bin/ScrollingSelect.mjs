import { useRoute } from './array-router/index.js';
import SelectBox from "./BooleanSelectBox.mjs";
import { jsx as _jsx } from "react/jsx-runtime";
export default function ScrollingSelect() {
  const [parts, options] = useRoute();
  const id = 'scrolling';
  const label = '&Scrolling';
  const items = [{
    label: 'on',
    value: true
  }, {
    label: 'off',
    value: false
  }];
  const value = options.scrolling;
  const home = 'main';
  const onSelect = ({
    value
  }) => options.scrolling = value;
  return /*#__PURE__*/_jsx(SelectBox, {
    id,
    label,
    items,
    value,
    home,
    onSelect
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VSb3V0ZSIsIlNlbGVjdEJveCIsIlNjcm9sbGluZ1NlbGVjdCIsInBhcnRzIiwib3B0aW9ucyIsImlkIiwibGFiZWwiLCJpdGVtcyIsInZhbHVlIiwic2Nyb2xsaW5nIiwiaG9tZSIsIm9uU2VsZWN0Il0sInNvdXJjZXMiOlsiU2Nyb2xsaW5nU2VsZWN0LmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VSb3V0ZSB9IGZyb20gJy4vYXJyYXktcm91dGVyL2luZGV4LmpzJztcbmltcG9ydCBTZWxlY3RCb3ggZnJvbSBcIi4vQm9vbGVhblNlbGVjdEJveC5qc3hcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2Nyb2xsaW5nU2VsZWN0KCkge1xuICBjb25zdCBbIHBhcnRzLCBvcHRpb25zIF0gPSB1c2VSb3V0ZSgpO1xuICBjb25zdCBpZCA9ICdzY3JvbGxpbmcnO1xuICBjb25zdCBsYWJlbCA9ICcmU2Nyb2xsaW5nJztcbiAgY29uc3QgaXRlbXMgPSBbXG4gICAgeyBsYWJlbDogJ29uJywgdmFsdWU6IHRydWUgfSxcbiAgICB7IGxhYmVsOiAnb2ZmJywgdmFsdWU6IGZhbHNlIH0sXG4gIF07XG4gIGNvbnN0IHZhbHVlID0gb3B0aW9ucy5zY3JvbGxpbmc7XG4gIGNvbnN0IGhvbWUgPSAnbWFpbic7XG4gIGNvbnN0IG9uU2VsZWN0ID0gKHsgdmFsdWUgfSkgPT4gb3B0aW9ucy5zY3JvbGxpbmcgPSB2YWx1ZTtcbiAgcmV0dXJuIDxTZWxlY3RCb3ggey4uLnsgaWQsIGxhYmVsLCBpdGVtcywgdmFsdWUsIGhvbWUsIG9uU2VsZWN0IH19IC8+O1xufSJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsUUFBUSxRQUFRLHlCQUF5QjtBQUNsRCxPQUFPQyxTQUFTO0FBQStCO0FBRS9DLGVBQWUsU0FBU0MsZUFBZSxHQUFHO0VBQ3hDLE1BQU0sQ0FBRUMsS0FBSyxFQUFFQyxPQUFPLENBQUUsR0FBR0osUUFBUSxFQUFFO0VBQ3JDLE1BQU1LLEVBQUUsR0FBRyxXQUFXO0VBQ3RCLE1BQU1DLEtBQUssR0FBRyxZQUFZO0VBQzFCLE1BQU1DLEtBQUssR0FBRyxDQUNaO0lBQUVELEtBQUssRUFBRSxJQUFJO0lBQUVFLEtBQUssRUFBRTtFQUFLLENBQUMsRUFDNUI7SUFBRUYsS0FBSyxFQUFFLEtBQUs7SUFBRUUsS0FBSyxFQUFFO0VBQU0sQ0FBQyxDQUMvQjtFQUNELE1BQU1BLEtBQUssR0FBR0osT0FBTyxDQUFDSyxTQUFTO0VBQy9CLE1BQU1DLElBQUksR0FBRyxNQUFNO0VBQ25CLE1BQU1DLFFBQVEsR0FBRyxDQUFDO0lBQUVIO0VBQU0sQ0FBQyxLQUFLSixPQUFPLENBQUNLLFNBQVMsR0FBR0QsS0FBSztFQUN6RCxvQkFBTyxLQUFDLFNBQVM7SUFBT0gsRUFBRTtJQUFFQyxLQUFLO0lBQUVDLEtBQUs7SUFBRUMsS0FBSztJQUFFRSxJQUFJO0lBQUVDO0VBQVEsRUFBTTtBQUN2RSJ9