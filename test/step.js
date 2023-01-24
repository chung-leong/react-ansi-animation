export function createSteps(invoke = null) {
  if (!invoke) {
    invoke = (cb) => setTimeout(cb, 0);
  }
  return new Proxy([], {
    get(arr, name) {
      const num = parseInt(name);
      if (isNaN(num)) {
        return arr[name];
      } else {
        let promise = arr[num];
        if (!promise) {
          let resolve, reject;
          promise = arr[num] = new Promise((r1, r2) => { resolve = r1; reject = r2; });
          promise.done = (value) => invoke(() => resolve(value));
          promise.fail = (err) => invoke(() => reject(err));
          promise.throw = (err, value) => {
            invoke(() => resolve(value));
            throw err;
          };
        }
        return promise;
      }
    }
  });
}

export async function loopThrough(steps, delay, fn) {
  let i = 0, interval = setInterval(() => steps[i++].done(), delay);
  try {
    await fn();
  } finally {
    clearInterval(interval);
  }
}
