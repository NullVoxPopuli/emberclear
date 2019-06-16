import { roundTrip } from './bench/round-trip';
import { keyGeneration } from './bench/key-generation';
import { nonceGeneration } from './bench/nonce-generation';
import { roundTrip as roundTripLong } from './bench/round-trip-long';
import { base64 } from './bench/base64';
import { stringConversion } from './bench/stringConvension';
import { hex } from './bench/hex';

async function runBenchmark() {
  // encryption-related things
  await roundTrip.run();
  await keyGeneration.run();
  await nonceGeneration.run();
  await roundTripLong.run();

  // conversion
  await base64.run();
  await stringConversion.run();
  await hex.run();
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
