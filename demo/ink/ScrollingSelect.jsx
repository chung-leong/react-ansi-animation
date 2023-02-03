import { useRoute } from './array-router/index.js';
import SelectBox from "./BooleanSelectBox.jsx";

export default function ScrollingSelect() {
  const [ parts, options ] = useRoute();
  const id = 'scrolling';
  const label = '&Scrolling';
  const items = [
    { label: 'on', value: true },
    { label: 'off', value: false },
  ];
  const value = options.scrolling;
  const home = 'main';
  const onSelect = ({ value }) => options.scrolling = value;
  return <SelectBox {...{ id, label, items, value, home, onSelect }} />;
}