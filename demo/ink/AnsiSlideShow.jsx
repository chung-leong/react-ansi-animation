import { useSequential } from 'react-seq';
import AnsiDisplay from './AnsiDisplay.jsx';
import { isAnsiFile, LoadingScreen } from './FileList.jsx';

export default function AnsiSlideShow({ srcList, onExit }) {
  return useSequential(async function*({ fallback, manageEvents }) {
    fallback(<LoadingScreen />);
    const [ on, eventual ] = manageEvents();
    let index = 0, played = 0, lastError = null;
    for (;;) {
      const path = srcList[index++];
      try {
        if (await isAnsiFile(path)) {
          yield <AnsiDisplay src={path} onExit={on.exitKey} onEnd={on.animationEnd} />;
          let { exitKey, animationEnd } = await eventual.animationEnd.or.exitKey;
          if (animationEnd) {
            // wait a little bit
            ({ exitKey } = await eventual.exitKey.for(10).seconds);
          }
          if (exitKey?.escape) {
            // escape ends the program
            onExit(exitKey);
            break;
          }
          played = true;
        }
      } catch (err) {
        lastError = err;
      }
      if (index >= srcList.length) {
        // end of the loop; if nothing got played then something is wrong
        if (played === 0) {
          if (!lastError) {
            lastError = new Error('No ANSI files found');
          }
          throw lastError;
        }
        index = 0;
      }
    }
  }, [ srcList, onExit ]);
}
