import { dirname } from 'path';
import { Box, Text } from 'ink';
import ModemSpeedSelect from './ModemSpeedSelect.jsx';
import BlinkingSelect from './BlinkingSelect.jsx';
import ScrollingSelect from './ScrollingSelect.jsx';
import TransparencySelect from './TransparencySelect.jsx';
import AnsiDisplay from './AnsiDisplay.jsx';
import AnsiSlideShow from './AnsiSlideShow.jsx';
import FileList from './FileList.jsx';

export default async function* main(methods) {
  const { wrap, manageRoute, manageEvents, replacing } = methods;
  const [ parts ] = manageRoute();
  const [ on, eventual ] = manageEvents();
  wrap((children) => {
    return (
      <Box>
        <Box flexDirection="column">
          <ModemSpeedSelect />
          <BlinkingSelect />
          <ScrollingSelect />
          <TransparencySelect />
        </Box>
        <Box>
          {children}
        </Box>
      </Box>
    );
  });
  for (;;) {
    try {
      if (parts[0] === undefined) {
        replacing(() => parts[0] = 'list')
      } else if (parts[0] === 'list') {
        yield <FileList folder={parts[1]} selected={parts[2]} onFileSelect={on.file} onFolderSelect={on.folder} />;
        const { file, folder } = await eventual.file.or.folder;
        parts.splice(0);
        if (folder) {
          parts.push('list', folder);
        } else if (file) {
          parts.push('show', file);
        }
      } else if (parts[0] === 'show') {
        const path = parts[1];
        yield <AnsiDisplay src={parts[1]} onExit={on.exit} />;
        await eventual.exit;
        parts.splice(0);
        parts.push('list', dirname(path), path);
      } else if (parts[0] === 'loop') {
        const paths = parts.slice(1);
        yield <AnsiSlideShow srcList={paths} onExit={on.exit} />;
        await eventual.exit;
        process.exit(0);
      } else {
        throw new Error(`Unrecognized command: ${parts[0]}`);
      }
    } catch (err) {
      // not sure why Ink complains when nothing is yielded prior to program exit
      yield null;
      console.error(err.message);      
      process.exit(1);
    }
  }
}


