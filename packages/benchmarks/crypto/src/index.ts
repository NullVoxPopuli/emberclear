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

runBenchmark();
