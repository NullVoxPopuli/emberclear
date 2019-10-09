import { bench as short } from "./bench/short";
import { bench as micro } from "./bench/micro";
import { bench as long } from "./bench/long";

import { bench as shortMiss } from "./bench/short-miss";
import { bench as microMiss } from "./bench/micro-miss";
import { bench as longMiss } from "./bench/long-miss";

import { bench as base } from "./bench/base";

async function runBenchmark() {
  await base.run();

  await micro.run();
  await short.run();
  await long.run();

  await microMiss.run();
  await shortMiss.run();
  await longMiss.run();
}

console.log(`
  Emoji Libraries:

        Name     | Size (min + gzip)
    -------------|------------------
    emojis       | 376 Bytes
`);

runBenchmark();
