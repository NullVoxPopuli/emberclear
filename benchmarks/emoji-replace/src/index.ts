import { bench as short } from "./bench/short";
import { bench as micro } from "./bench/micro";
import { bench as long } from "./bench/long";

async function runBenchmark() {
  await micro.run();
  await short.run();
  await long.run();
}

console.log(`
  Emoji Libraries:

        Name     | Size (min + gzip)
    -------------|------------------
    emojis       | 376 Bytes
`);

runBenchmark();
