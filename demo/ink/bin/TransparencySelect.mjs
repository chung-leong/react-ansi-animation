import { useRoute } from 'array-router';
import SelectBox from "./SelectBox.mjs";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VSb3V0ZSIsIlNlbGVjdEJveCIsIlRyYW5zcGFyZW5jeVNlbGVjdCIsInBhcnRzIiwib3B0aW9ucyIsImlkIiwibGFiZWwiLCJpdGVtcyIsInZhbHVlIiwidHJhbnNwYXJlbmN5IiwiaG9tZSIsIm9uU2VsZWN0Il0sInNvdXJjZXMiOlsiVHJhbnNwYXJlbmN5U2VsZWN0LmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VSb3V0ZSB9IGZyb20gJ2FycmF5LXJvdXRlcic7XG5pbXBvcnQgU2VsZWN0Qm94IGZyb20gXCIuL1NlbGVjdEJveC5qc3hcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gVHJhbnNwYXJlbmN5U2VsZWN0KCkge1xuICBjb25zdCBbIHBhcnRzLCBvcHRpb25zIF0gPSB1c2VSb3V0ZSgpO1xuICBjb25zdCBpZCA9ICd0cmFuc3BhcmVuY3knO1xuICBjb25zdCBsYWJlbCA9ICcmVHJhbnNwYXJlbmN5JztcbiAgY29uc3QgaXRlbXMgPSBbXG4gICAgeyBsYWJlbDogJ29uJywgdmFsdWU6IHRydWUgfSxcbiAgICB7IGxhYmVsOiAnb2ZmJywgdmFsdWU6IGZhbHNlIH0sXG4gIF07XG4gIGNvbnN0IHZhbHVlID0gb3B0aW9ucy50cmFuc3BhcmVuY3k7XG4gIGNvbnN0IGhvbWUgPSAnbWFpbic7XG4gIGNvbnN0IG9uU2VsZWN0ID0gKHsgdmFsdWUgfSkgPT4gb3B0aW9ucy50cmFuc3BhcmVuY3kgPSB2YWx1ZTtcbiAgcmV0dXJuIDxTZWxlY3RCb3ggey4uLnsgaWQsIGxhYmVsLCBpdGVtcywgdmFsdWUsIGhvbWUsIG9uU2VsZWN0IH19IC8+O1xufSJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsUUFBUSxRQUFRLGNBQWM7QUFDdkMsT0FBT0MsU0FBUztBQUF3QjtBQUV4QyxlQUFlLFNBQVNDLGtCQUFrQixHQUFHO0VBQzNDLE1BQU0sQ0FBRUMsS0FBSyxFQUFFQyxPQUFPLENBQUUsR0FBR0osUUFBUSxFQUFFO0VBQ3JDLE1BQU1LLEVBQUUsR0FBRyxjQUFjO0VBQ3pCLE1BQU1DLEtBQUssR0FBRyxlQUFlO0VBQzdCLE1BQU1DLEtBQUssR0FBRyxDQUNaO0lBQUVELEtBQUssRUFBRSxJQUFJO0lBQUVFLEtBQUssRUFBRTtFQUFLLENBQUMsRUFDNUI7SUFBRUYsS0FBSyxFQUFFLEtBQUs7SUFBRUUsS0FBSyxFQUFFO0VBQU0sQ0FBQyxDQUMvQjtFQUNELE1BQU1BLEtBQUssR0FBR0osT0FBTyxDQUFDSyxZQUFZO0VBQ2xDLE1BQU1DLElBQUksR0FBRyxNQUFNO0VBQ25CLE1BQU1DLFFBQVEsR0FBRyxDQUFDO0lBQUVIO0VBQU0sQ0FBQyxLQUFLSixPQUFPLENBQUNLLFlBQVksR0FBR0QsS0FBSztFQUM1RCxvQkFBTyxLQUFDLFNBQVM7SUFBT0gsRUFBRTtJQUFFQyxLQUFLO0lBQUVDLEtBQUs7SUFBRUMsS0FBSztJQUFFRSxJQUFJO0lBQUVDO0VBQVEsRUFBTTtBQUN2RSJ9