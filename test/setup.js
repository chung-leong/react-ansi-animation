import AbortController from 'abort-controller';

if (!(AbortController in global)) {
  global.AbortController = AbortController;
}

global.resolve = (path) => {
  return (new URL(path, import.meta.url)).pathname;
};