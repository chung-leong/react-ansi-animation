import { useRoute } from './array-router/index.js';
import SelectBox from "./BooleanSelectBox.jsx";

export default function TransparencySelect() {
  const [ parts, options ] = useRoute();
  const id = 'transparency';
  const label = '&Transparency';
  const items = [
    { label: 'on', value: true },
    { label: 'off', value: false },
  ];
  const value = options.transparency;
  const home = 'main';
  const onSelect = ({ value }) => options.transparency = value;
  return <SelectBox {...{ id, label, items, value, home, onSelect }} />;
}