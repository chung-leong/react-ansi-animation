import { readdir, open } from 'fs/promises';
import { basename, normalize } from 'path';
import { useProgressive } from 'react-seq';
import { useFocus, Box, Text } from 'ink';
import MulticolumnSelectInput from 'ink-multicolumn-select-input';
import InkSpinner from 'ink-spinner'; const { default: Spinner } = InkSpinner;

export default function FileList({ folder = '.', selected = '', onFileSelect, onFolderSelect }) {
  return useProgressive(async ({ fallback, type, usable, defer }) => {
    fallback(<LoadingScreen />);
    type(FileListUI);
    usable(5);
    defer(100);
    return {
      folders: findSubfolder(folder),
      files: findAnsiFiles(folder),
      selected,
      onFileSelect, 
      onFolderSelect,
    };
  }, [ folder ]);
}

// typical ANSI files are 79x24
const width = 81;
const height = 26;
const borderStyle = 'round';

function FileListUI({ folders = [], files = [], selected, onFileSelect, onFolderSelect }) {
  const { isFocused } = useFocus({ id: 'main', autoFocus: true });
  const items = [];
  for (const folder of folders) {
    items.push({ label: '\u{1F5C0} ' + basename(folder), value: folder, type: 'folder' })
  }
  for (const file of files) {
    items.push({ label: '\u{1F5CF} ' + basename(file), value: file, type: 'file' })
  }
  // ensure that columns are wide enough for the longest filename
  const maxWidth = items.reduce((m, i) => m = Math.max(m, i.label.length), 0);
  const columnCount = Math.max(1, Math.floor(80 / (maxWidth + 2)));
  const limit = height - 2;
  const initialIndex = Math.max(0, items.findIndex(i => i.value === selected));
  const borderColor = (isFocused) ? 'blue' : undefined;
  const onSelect = ({ value, type }) => {
    if (type === 'folder') {
      onFolderSelect?.(value);
    } else if (type === 'file') {
      onFileSelect?.(value);
    }
  };
  return (
    <Box {...{ borderStyle, borderColor, width }}>
      <MulticolumnSelectInput {...{ items, limit, columnCount, isFocused, initialIndex, onSelect }} />
    </Box>
  );
}

export function LoadingScreen() {
  const alignItems = 'center';
  const justifyContent = 'center';
  return (
    <Box {...{ borderStyle, width, height, alignItems, justifyContent }}>
      <Text> <Spinner /> Loading</Text>
    </Box>
  );
}

async function* findSubfolder(folder) {
  const list = await readdir(folder, { withFileTypes: true });
  yield normalize(`${folder}/..`);
  for (const entry of list) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      yield `${folder}/${entry.name}`;
    }
  }
}

async function* findAnsiFiles(folder) {
  const list = await readdir(folder, { withFileTypes: true });
  for (const entry of list) {
    if (entry.isFile() && !entry.name.startsWith('.')) {
      const path = `${folder}/${entry.name}`;
      if (await isAnsiFile(path)) {
        yield path;
      }
    }
  }
}

export async function isAnsiFile(path) {
  let file;
  try {
    file = await open(path);
    const buffer = Buffer.alloc(1024);
    const { bytesRead } = await file.read(buffer, 0, buffer.length);
    const array = new Uint8Array(buffer, 0, bytesRead);
    for (let i = 0; i < array.length - 1; i++) {
      if (array[i] === 0x1B && array[i + 1] === 0x5B) {
        return true;
      }
    }
  } catch (err) {
  } finally {
    await file?.close();
  }
  return false;
}