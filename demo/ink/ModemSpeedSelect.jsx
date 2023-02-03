import { useRoute } from './array-router/index.js';
import SelectBox from './SelectBox.jsx';

export default function ModemSpeedSelect() {
  const [ parts, options ] = useRoute();
  const id = 'modemSpeed';
  const label = '&Modem speed';
  const items = [
      { label: '2400', value: 2400 },
      { label: '9600', value: 9600 },
      { label: '14400', value: 14400 },
      { label: '19200', value: 19200 },
      { label: '28800', value: 28800 },
      { label: '33600', value: 33600 },
      { label: '56000', value: 56000 },
      { label: '115200', value: 115200 },
      { label: '230400', value: 230400 },
      { label: '460800', value: 460800 },
      { label: '576000', value: 576000 },
      { label: '921600', value: 921600 },
      { label: 'Infinity', value: Infinity },
    ];
  const value = options.modemSpeed;
  const home = 'main';
  const onSelect = ({ value }) => options.modemSpeed = value;
  return <SelectBox  {...{ id, label, items, value, home, onSelect }} />;
}
