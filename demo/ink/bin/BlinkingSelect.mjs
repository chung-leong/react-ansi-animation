import { useRoute } from './array-router/index.js';
import SelectBox from "./BooleanSelectBox.mjs";
import { jsx as _jsx } from "react/jsx-runtime";
export default function BlinkingSelect() {
  const [parts, options] = useRoute();
  const id = 'blinking';
  const label = '&Blinking';
  const items = [{
    label: 'on',
    value: true
  }, {
    label: 'off',
    value: false
  }];
  const value = options.blinking;
  const home = 'main';
  const onSelect = ({
    value
  }) => options.blinking = value;
  return /*#__PURE__*/_jsx(SelectBox, {
    id,
    label,
    items,
    value,
    home,
    onSelect
  });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VSb3V0ZSIsIlNlbGVjdEJveCIsIkJsaW5raW5nU2VsZWN0IiwicGFydHMiLCJvcHRpb25zIiwiaWQiLCJsYWJlbCIsIml0ZW1zIiwidmFsdWUiLCJibGlua2luZyIsImhvbWUiLCJvblNlbGVjdCJdLCJzb3VyY2VzIjpbIkJsaW5raW5nU2VsZWN0LmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VSb3V0ZSB9IGZyb20gJy4vYXJyYXktcm91dGVyL2luZGV4LmpzJztcbmltcG9ydCBTZWxlY3RCb3ggZnJvbSBcIi4vQm9vbGVhblNlbGVjdEJveC5qc3hcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQmxpbmtpbmdTZWxlY3QoKSB7XG4gIGNvbnN0IFsgcGFydHMsIG9wdGlvbnMgXSA9IHVzZVJvdXRlKCk7XG4gIGNvbnN0IGlkID0gJ2JsaW5raW5nJztcbiAgY29uc3QgbGFiZWwgPSAnJkJsaW5raW5nJztcbiAgY29uc3QgaXRlbXMgPSBbXG4gICAgeyBsYWJlbDogJ29uJywgdmFsdWU6IHRydWUgfSxcbiAgICB7IGxhYmVsOiAnb2ZmJywgdmFsdWU6IGZhbHNlIH0sXG4gIF07XG4gIGNvbnN0IHZhbHVlID0gb3B0aW9ucy5ibGlua2luZztcbiAgY29uc3QgaG9tZSA9ICdtYWluJztcbiAgY29uc3Qgb25TZWxlY3QgPSAoeyB2YWx1ZSB9KSA9PiBvcHRpb25zLmJsaW5raW5nID0gdmFsdWU7XG4gIHJldHVybiA8U2VsZWN0Qm94IHsuLi57IGlkLCBsYWJlbCwgaXRlbXMsIHZhbHVlLCBob21lLCBvblNlbGVjdCB9fSAvPjtcbn0iXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLFFBQVEsUUFBUSx5QkFBeUI7QUFDbEQsT0FBT0MsU0FBUztBQUErQjtBQUUvQyxlQUFlLFNBQVNDLGNBQWMsR0FBRztFQUN2QyxNQUFNLENBQUVDLEtBQUssRUFBRUMsT0FBTyxDQUFFLEdBQUdKLFFBQVEsRUFBRTtFQUNyQyxNQUFNSyxFQUFFLEdBQUcsVUFBVTtFQUNyQixNQUFNQyxLQUFLLEdBQUcsV0FBVztFQUN6QixNQUFNQyxLQUFLLEdBQUcsQ0FDWjtJQUFFRCxLQUFLLEVBQUUsSUFBSTtJQUFFRSxLQUFLLEVBQUU7RUFBSyxDQUFDLEVBQzVCO0lBQUVGLEtBQUssRUFBRSxLQUFLO0lBQUVFLEtBQUssRUFBRTtFQUFNLENBQUMsQ0FDL0I7RUFDRCxNQUFNQSxLQUFLLEdBQUdKLE9BQU8sQ0FBQ0ssUUFBUTtFQUM5QixNQUFNQyxJQUFJLEdBQUcsTUFBTTtFQUNuQixNQUFNQyxRQUFRLEdBQUcsQ0FBQztJQUFFSDtFQUFNLENBQUMsS0FBS0osT0FBTyxDQUFDSyxRQUFRLEdBQUdELEtBQUs7RUFDeEQsb0JBQU8sS0FBQyxTQUFTO0lBQU9ILEVBQUU7SUFBRUMsS0FBSztJQUFFQyxLQUFLO0lBQUVDLEtBQUs7SUFBRUUsSUFBSTtJQUFFQztFQUFRLEVBQU07QUFDdkUifQ==