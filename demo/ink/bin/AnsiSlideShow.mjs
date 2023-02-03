import { useSequential } from 'react-seq';
import AnsiDisplay from "./AnsiDisplay.mjs";
import { isAnsiFile, LoadingScreen } from "./FileList.mjs";
import { jsx as _jsx } from "react/jsx-runtime";
export default function AnsiSlideShow({
  srcList,
  onExit
}) {
  return useSequential(async function* ({
    fallback,
    manageEvents
  }) {
    fallback( /*#__PURE__*/_jsx(LoadingScreen, {}));
    const [on, eventual] = manageEvents();
    let index = 0,
      played = 0,
      lastError = null;
    for (;;) {
      const path = srcList[index++];
      try {
        if (await isAnsiFile(path)) {
          yield /*#__PURE__*/_jsx(AnsiDisplay, {
            src: path,
            onExit: on.exitKey,
            onEnd: on.animationEnd
          });
          let {
            exitKey,
            animationEnd
          } = await eventual.animationEnd.or.exitKey;
          if (animationEnd) {
            // wait a little bit
            ({
              exitKey
            } = await eventual.exitKey.for(10).seconds);
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
  }, [srcList, onExit]);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ1c2VTZXF1ZW50aWFsIiwiQW5zaURpc3BsYXkiLCJpc0Fuc2lGaWxlIiwiTG9hZGluZ1NjcmVlbiIsIkFuc2lTbGlkZVNob3ciLCJzcmNMaXN0Iiwib25FeGl0IiwiZmFsbGJhY2siLCJtYW5hZ2VFdmVudHMiLCJvbiIsImV2ZW50dWFsIiwiaW5kZXgiLCJwbGF5ZWQiLCJsYXN0RXJyb3IiLCJwYXRoIiwiZXhpdEtleSIsImFuaW1hdGlvbkVuZCIsIm9yIiwiZm9yIiwic2Vjb25kcyIsImVzY2FwZSIsImVyciIsImxlbmd0aCIsIkVycm9yIl0sInNvdXJjZXMiOlsiQW5zaVNsaWRlU2hvdy5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU2VxdWVudGlhbCB9IGZyb20gJ3JlYWN0LXNlcSc7XG5pbXBvcnQgQW5zaURpc3BsYXkgZnJvbSAnLi9BbnNpRGlzcGxheS5qc3gnO1xuaW1wb3J0IHsgaXNBbnNpRmlsZSwgTG9hZGluZ1NjcmVlbiB9IGZyb20gJy4vRmlsZUxpc3QuanN4JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQW5zaVNsaWRlU2hvdyh7IHNyY0xpc3QsIG9uRXhpdCB9KSB7XG4gIHJldHVybiB1c2VTZXF1ZW50aWFsKGFzeW5jIGZ1bmN0aW9uKih7IGZhbGxiYWNrLCBtYW5hZ2VFdmVudHMgfSkge1xuICAgIGZhbGxiYWNrKDxMb2FkaW5nU2NyZWVuIC8+KTtcbiAgICBjb25zdCBbIG9uLCBldmVudHVhbCBdID0gbWFuYWdlRXZlbnRzKCk7XG4gICAgbGV0IGluZGV4ID0gMCwgcGxheWVkID0gMCwgbGFzdEVycm9yID0gbnVsbDtcbiAgICBmb3IgKDs7KSB7XG4gICAgICBjb25zdCBwYXRoID0gc3JjTGlzdFtpbmRleCsrXTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChhd2FpdCBpc0Fuc2lGaWxlKHBhdGgpKSB7XG4gICAgICAgICAgeWllbGQgPEFuc2lEaXNwbGF5IHNyYz17cGF0aH0gb25FeGl0PXtvbi5leGl0S2V5fSBvbkVuZD17b24uYW5pbWF0aW9uRW5kfSAvPjtcbiAgICAgICAgICBsZXQgeyBleGl0S2V5LCBhbmltYXRpb25FbmQgfSA9IGF3YWl0IGV2ZW50dWFsLmFuaW1hdGlvbkVuZC5vci5leGl0S2V5O1xuICAgICAgICAgIGlmIChhbmltYXRpb25FbmQpIHtcbiAgICAgICAgICAgIC8vIHdhaXQgYSBsaXR0bGUgYml0XG4gICAgICAgICAgICAoeyBleGl0S2V5IH0gPSBhd2FpdCBldmVudHVhbC5leGl0S2V5LmZvcigxMCkuc2Vjb25kcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChleGl0S2V5Py5lc2NhcGUpIHtcbiAgICAgICAgICAgIC8vIGVzY2FwZSBlbmRzIHRoZSBwcm9ncmFtXG4gICAgICAgICAgICBvbkV4aXQoZXhpdEtleSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgcGxheWVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGxhc3RFcnJvciA9IGVycjtcbiAgICAgIH1cbiAgICAgIGlmIChpbmRleCA+PSBzcmNMaXN0Lmxlbmd0aCkge1xuICAgICAgICAvLyBlbmQgb2YgdGhlIGxvb3A7IGlmIG5vdGhpbmcgZ290IHBsYXllZCB0aGVuIHNvbWV0aGluZyBpcyB3cm9uZ1xuICAgICAgICBpZiAocGxheWVkID09PSAwKSB7XG4gICAgICAgICAgaWYgKCFsYXN0RXJyb3IpIHtcbiAgICAgICAgICAgIGxhc3RFcnJvciA9IG5ldyBFcnJvcignTm8gQU5TSSBmaWxlcyBmb3VuZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBsYXN0RXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgaW5kZXggPSAwO1xuICAgICAgfVxuICAgIH1cbiAgfSwgWyBzcmNMaXN0LCBvbkV4aXQgXSk7XG59XG4iXSwibWFwcGluZ3MiOiJBQUFBLFNBQVNBLGFBQWEsUUFBUSxXQUFXO0FBQ3pDLE9BQU9DLFdBQVc7QUFDbEIsU0FBU0MsVUFBVSxFQUFFQyxhQUFhO0FBQXlCO0FBRTNELGVBQWUsU0FBU0MsYUFBYSxDQUFDO0VBQUVDLE9BQU87RUFBRUM7QUFBTyxDQUFDLEVBQUU7RUFDekQsT0FBT04sYUFBYSxDQUFDLGlCQUFnQjtJQUFFTyxRQUFRO0lBQUVDO0VBQWEsQ0FBQyxFQUFFO0lBQy9ERCxRQUFRLGVBQUMsS0FBQyxhQUFhLEtBQUcsQ0FBQztJQUMzQixNQUFNLENBQUVFLEVBQUUsRUFBRUMsUUFBUSxDQUFFLEdBQUdGLFlBQVksRUFBRTtJQUN2QyxJQUFJRyxLQUFLLEdBQUcsQ0FBQztNQUFFQyxNQUFNLEdBQUcsQ0FBQztNQUFFQyxTQUFTLEdBQUcsSUFBSTtJQUMzQyxTQUFTO01BQ1AsTUFBTUMsSUFBSSxHQUFHVCxPQUFPLENBQUNNLEtBQUssRUFBRSxDQUFDO01BQzdCLElBQUk7UUFDRixJQUFJLE1BQU1ULFVBQVUsQ0FBQ1ksSUFBSSxDQUFDLEVBQUU7VUFDMUIsbUJBQU0sS0FBQyxXQUFXO1lBQUMsR0FBRyxFQUFFQSxJQUFLO1lBQUMsTUFBTSxFQUFFTCxFQUFFLENBQUNNLE9BQVE7WUFBQyxLQUFLLEVBQUVOLEVBQUUsQ0FBQ087VUFBYSxFQUFHO1VBQzVFLElBQUk7WUFBRUQsT0FBTztZQUFFQztVQUFhLENBQUMsR0FBRyxNQUFNTixRQUFRLENBQUNNLFlBQVksQ0FBQ0MsRUFBRSxDQUFDRixPQUFPO1VBQ3RFLElBQUlDLFlBQVksRUFBRTtZQUNoQjtZQUNBLENBQUM7Y0FBRUQ7WUFBUSxDQUFDLEdBQUcsTUFBTUwsUUFBUSxDQUFDSyxPQUFPLENBQUNHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQ0MsT0FBTztVQUN2RDtVQUNBLElBQUlKLE9BQU8sRUFBRUssTUFBTSxFQUFFO1lBQ25CO1lBQ0FkLE1BQU0sQ0FBQ1MsT0FBTyxDQUFDO1lBQ2Y7VUFDRjtVQUNBSCxNQUFNLEdBQUcsSUFBSTtRQUNmO01BQ0YsQ0FBQyxDQUFDLE9BQU9TLEdBQUcsRUFBRTtRQUNaUixTQUFTLEdBQUdRLEdBQUc7TUFDakI7TUFDQSxJQUFJVixLQUFLLElBQUlOLE9BQU8sQ0FBQ2lCLE1BQU0sRUFBRTtRQUMzQjtRQUNBLElBQUlWLE1BQU0sS0FBSyxDQUFDLEVBQUU7VUFDaEIsSUFBSSxDQUFDQyxTQUFTLEVBQUU7WUFDZEEsU0FBUyxHQUFHLElBQUlVLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztVQUM5QztVQUNBLE1BQU1WLFNBQVM7UUFDakI7UUFDQUYsS0FBSyxHQUFHLENBQUM7TUFDWDtJQUNGO0VBQ0YsQ0FBQyxFQUFFLENBQUVOLE9BQU8sRUFBRUMsTUFBTSxDQUFFLENBQUM7QUFDekIifQ==