import { bench as short } from './bench/short';

async function runBenchmark() {
  await short.run();
}

console.log(`
  Emoji Libraries:

        Name     | Size (min + gzip)
    -------------|------------------
    emojis       | 376 Bytes
`);

runBenchmark();
