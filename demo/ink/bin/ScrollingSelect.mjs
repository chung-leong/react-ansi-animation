import { useRoute } from 'array-router';
import SelectBox from "./SelectBox.mjs";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VSb3V0ZSIsIlNlbGVjdEJveCIsIlNjcm9sbGluZ1NlbGVjdCIsInBhcnRzIiwib3B0aW9ucyIsImlkIiwibGFiZWwiLCJpdGVtcyIsInZhbHVlIiwic2Nyb2xsaW5nIiwiaG9tZSIsIm9uU2VsZWN0Il0sInNvdXJjZXMiOlsiU2Nyb2xsaW5nU2VsZWN0LmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VSb3V0ZSB9IGZyb20gJ2FycmF5LXJvdXRlcic7XG5pbXBvcnQgU2VsZWN0Qm94IGZyb20gXCIuL1NlbGVjdEJveC5qc3hcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gU2Nyb2xsaW5nU2VsZWN0KCkge1xuICBjb25zdCBbIHBhcnRzLCBvcHRpb25zIF0gPSB1c2VSb3V0ZSgpO1xuICBjb25zdCBpZCA9ICdzY3JvbGxpbmcnO1xuICBjb25zdCBsYWJlbCA9ICcmU2Nyb2xsaW5nJztcbiAgY29uc3QgaXRlbXMgPSBbXG4gICAgeyBsYWJlbDogJ29uJywgdmFsdWU6IHRydWUgfSxcbiAgICB7IGxhYmVsOiAnb2ZmJywgdmFsdWU6IGZhbHNlIH0sXG4gIF07XG4gIGNvbnN0IHZhbHVlID0gb3B0aW9ucy5zY3JvbGxpbmc7XG4gIGNvbnN0IGhvbWUgPSAnbWFpbic7XG4gIGNvbnN0IG9uU2VsZWN0ID0gKHsgdmFsdWUgfSkgPT4gb3B0aW9ucy5zY3JvbGxpbmcgPSB2YWx1ZTtcbiAgcmV0dXJuIDxTZWxlY3RCb3ggey4uLnsgaWQsIGxhYmVsLCBpdGVtcywgdmFsdWUsIGhvbWUsIG9uU2VsZWN0IH19IC8+O1xufSJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBU0EsUUFBUSxRQUFRLGNBQWM7QUFDdkMsT0FBT0MsU0FBUztBQUF3QjtBQUV4QyxlQUFlLFNBQVNDLGVBQWUsR0FBRztFQUN4QyxNQUFNLENBQUVDLEtBQUssRUFBRUMsT0FBTyxDQUFFLEdBQUdKLFFBQVEsRUFBRTtFQUNyQyxNQUFNSyxFQUFFLEdBQUcsV0FBVztFQUN0QixNQUFNQyxLQUFLLEdBQUcsWUFBWTtFQUMxQixNQUFNQyxLQUFLLEdBQUcsQ0FDWjtJQUFFRCxLQUFLLEVBQUUsSUFBSTtJQUFFRSxLQUFLLEVBQUU7RUFBSyxDQUFDLEVBQzVCO0lBQUVGLEtBQUssRUFBRSxLQUFLO0lBQUVFLEtBQUssRUFBRTtFQUFNLENBQUMsQ0FDL0I7RUFDRCxNQUFNQSxLQUFLLEdBQUdKLE9BQU8sQ0FBQ0ssU0FBUztFQUMvQixNQUFNQyxJQUFJLEdBQUcsTUFBTTtFQUNuQixNQUFNQyxRQUFRLEdBQUcsQ0FBQztJQUFFSDtFQUFNLENBQUMsS0FBS0osT0FBTyxDQUFDSyxTQUFTLEdBQUdELEtBQUs7RUFDekQsb0JBQU8sS0FBQyxTQUFTO0lBQU9ILEVBQUU7SUFBRUMsS0FBSztJQUFFQyxLQUFLO0lBQUVDLEtBQUs7SUFBRUUsSUFBSTtJQUFFQztFQUFRLEVBQU07QUFDdkUifQ==