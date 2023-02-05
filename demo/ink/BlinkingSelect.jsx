import { useRoute } from 'array-router';
import SelectBox from "./SelectBox.jsx";

export default function BlinkingSelect() {
  const [ parts, options ] = useRoute();
  const id = 'blinking';
  const label = '&Blinking';
  const items = [
    { label: 'on', value: true },
    { label: 'off', value: false },
  ];
  const value = options.blinking;
  const home = 'main';
  const onSelect = ({ value }) => options.blinking = value;
  return <SelectBox {...{ id, label, items, value, home, onSelect }} />;
}