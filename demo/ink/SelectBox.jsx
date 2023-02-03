import { useFocus, useInput, Text, Box } from 'ink';
import InkSelectInput from 'ink-select-input'; const { default: SelectInput } = InkSelectInput;

export default function SelectBox({ id, items, label: labelWithAmp, value, home, onSelect: onSelectCaller }) {
  const { isFocused, focus } = useFocus({ id });
  const initialIndex = items.findIndex(i => i.value === value);
  const [ label, hotkey ] = extractHotkey(labelWithAmp);
  useInput((input) => {
    if (input.toUpperCase() === hotkey) {
      focus(id);
    }
  }, { isActive: !isFocused });
  if (isFocused) {
    const onSelect = (item) => {
      onSelectCaller?.(item);
      if (home) {
        // refocus main content (after this component has updated)
        setTimeout(() => focus(home), 0);
      }
    };
    return (
      <Box borderStyle="round" borderColor="blue">
        <Text>{label}</Text>
        <SelectInput {...{ items, initialIndex, onSelect }} />
      </Box>
    );
  } else {
    const minWidth = items.reduce((w, i) => Math.max(w, i.label.length + 2), 2);
    const item = items[initialIndex];
    return (
      <Box borderStyle="round">
        <Text>{label}</Text>
        <Box minWidth={minWidth}><Text>: {item?.label}</Text></Box>
      </Box>
    );
  }
}

function extractHotkey(labelWithAmp) {
  const m = /(.*)&(\w)(.*)/.exec(labelWithAmp);
  if (!m) {
    return [ labelWithAmp ];
  }
  return [
    <Text>{m[1]}<Text underline>{m[2]}</Text>{m[3]}</Text>,
    m[2].toUpperCase()
  ];
}