import { module, test } from 'qunit';

import { samplePrivateKey } from 'emberclear/tests/helpers/fixtures';
import {
  mnemonicFromNaClBoxPrivateKey,
  toUint11Array,
  naclBoxPrivateKeyFromMnemonic,
  toUint8Array,
} from 'emberclear/workers/crypto/utils/mnemonic';

module('Workers | Crypto | mnemonic', function() {
  const numbers = {
    ['32']: new Uint8Array([0x20]),
    ['64']: new Uint8Array([0x40]),
    ['2048']: new Uint8Array([0x8, 0]),
    ['4096']: new Uint8Array([0x10, 0]),
    ['7331']: new Uint8Array([0xa3, 0x1c]),
  };

  test('mnemonicFromNaClBoxPrivateKey | converts a private key to english', async function(assert) {
    const result = await mnemonicFromNaClBoxPrivateKey(samplePrivateKey);

    // prettier-ignore
    const expected = `
      tornado priority nasty potato comic
      then upper labor suspect kind
      embody climb hero very decide
      banana pigeon apple teach master
      head season hood ability fossil
    `.replace(/[ \n\r]+/g, ' ').trim();

    assert.deepEqual(result, expected);
  });

  test('key can be converted and recovered', async function(assert) {
    const mnemonic = await mnemonicFromNaClBoxPrivateKey(samplePrivateKey);
    const result = await naclBoxPrivateKeyFromMnemonic(mnemonic);

    assert.deepEqual(result, samplePrivateKey);
  });

  test('toUint11Array | converts | 32 (8 bits)', function(assert) {
    const result = toUint11Array(numbers['32']);
    const expected = [32];

    assert.deepEqual(result, expected);
  });

  test('toUint11Array | converts | 2048 (12 bits)', function(assert) {
    const result = toUint11Array(numbers['2048']);
    const expected = [8, 0];

    assert.deepEqual(result, expected);
  });

  test('toUint11Array | converts | 4096 (13 bits)', function(assert) {
    const result = toUint11Array(numbers['4096']);
    const expected = [16, 0];

    assert.deepEqual(result, expected);
  });

  test('toUint11Array | converts | 7331 (13 bits)', function(assert) {
    const result = toUint11Array(numbers['7331']);
    const expected = [1187, 3];

    assert.deepEqual(result, expected);
  });

  test('toUint11Array | converts | private key', function(assert) {
    const result = toUint11Array(samplePrivateKey);

    // prettier-ignore
    const expected = [
      1835, 1367, 1177, 1350, 370,
      1793, 1912, 994, 1750, 980,
      579, 344, 858, 1943, 454,
      145, 1317, 85, 1780, 1093,
      848, 1553, 874, 1
    ];

    assert.deepEqual(result, expected);
  });

  test('toUint8Array | converts | 32', function(assert) {
    const result = toUint8Array([32]);
    const expected = numbers['32'];

    assert.deepEqual(result, expected);
  });

  test('toUint8Array | converts | 2048', function(assert) {
    const result = toUint8Array([8, 0]);
    const expected = numbers['2048'];

    assert.deepEqual(result, expected);
  });

  test('toUint8Array | converts | 4096', function(assert) {
    const result = toUint8Array([16, 0]);
    const expected = numbers['4096'];

    assert.deepEqual(result, expected);
  });

  test('toUint8Array | converts | 7331', function(assert) {
    const result = toUint8Array([1187, 3]);
    const expected = numbers['7331'];

    assert.deepEqual(result, expected);
  });
});
