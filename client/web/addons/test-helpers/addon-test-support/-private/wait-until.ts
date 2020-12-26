/**
 * @ember/test-helpers' waitUntil does not take a Promise for the callback
 */
export async function waitUntil(func: () => Promise<boolean>, timeoutMs = 500) {
  let interval: NodeJS.Timeout;

  const timeout = new Promise((_resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      clearInterval(interval);
      reject(`Timed out after ${timeoutMs} ms.`);
    }, timeoutMs);
  });

  let startTime = new Date();

  return Promise.race([
    new Promise((resolve, reject) => {
      let interval = setInterval(async () => {
        if (new Date().getTime() - startTime.getTime() > 500) {
          clearInterval(interval);
          reject(`Timed out after ${timeoutMs}`);
        }

        let result = false;

        try {
          result = await func();
        } catch (e) {
          // ignored
        }

        if (result) {
          clearInterval(interval);
          resolve(undefined);
        }
      }, 10);
    }),
    timeout,
  ]);
}
