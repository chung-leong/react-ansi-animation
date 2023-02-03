import { useRoute } from './array-router/index.js';
import { useFocus, useInput, Box } from 'ink';
import { AnsiText } from './react-ansi-animation/ink.js';

export default function AnsiDisplay({ src, onExit, onEnd }) {
  const { isFocused } = useFocus({ id: 'main', autoFocus: true });
  const [ parts, options ] = useRoute();
  const { modemSpeed, blinking, scrolling, transparency } = options;
  useInput((input, key) => {
    if (key.escape || key.return || input === ' ') {
      onExit?.(key);
    }
  }, { isActive: isFocused })
  const borderStyle = 'round';
  const borderColor = (isFocused) ? 'blue' : undefined;
  const flexDirection = 'column';
  const maxHeight = (scrolling) ? 24 : 1024;
  const onStatus = (status) => {
    if (status.position === 1) {
      // played to 100%
      onEnd?.(status);
    }
  };
  return (
    <Box {...{ borderStyle, borderColor, flexDirection }}>
      <AnsiText {...{ src, modemSpeed, blinking, maxHeight, transparency, onStatus }} />
    </Box>
  );
}