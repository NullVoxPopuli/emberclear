import { roundTrip } from './bench/round-trip';
import { keyGeneration } from './bench/key-generation';
import { nonceGeneration } from './bench/nonce-generation';
import { roundTrip as roundTripLong } from './bench/round-trip-long';

async function runBenchmark() {
  await roundTrip.run();
  await keyGeneration.run();
  await nonceGeneration.run();
  await roundTripLong.run();
}

console.log(`
  Box Encryption Libraries:

        Name     | Size (min + gzip)
    -------------|------------------
    tweet-nacl   | 10.4  kB
    libsodium    | 192.1 kB
    js-nacl      | 212.9 kB
`);

runBenchmark();
