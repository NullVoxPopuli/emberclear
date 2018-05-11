import * as nacl from './utils';

import { module, test } from 'qunit';
import { mnemonicFromNaClBoxPrivateKey, toUint11Array, naclBoxPrivateKeyFromMnemonic } from './utils';
import { fromString } from 'emberclear/src/utils/string-encoding';


module('Unit | Utility | mnemonic', function() {
  // no one use this!
  const samplePrivateKey = fromString('lS2wl26RcF9F2-gtCACQ6N4TsSrLx7qT9hFT5zrdW9A');

  const numbers = {
    ['32']: new Uint8Array([0x20]),
    ['64']: new Uint8Array([0x40]),
    ['2048']: new Uint8Array([0x8, 0]),
    ['4096']: new Uint8Array([0x10, 0]),
    ['7331']: new Uint8Array([0xA3, 0x1C])
  }


  test('mnemonicFromNaClBoxPrivateKey | converts a private key to english', function(assert) {
    const result = mnemonicFromNaClBoxPrivateKey(samplePrivateKey);
    const expected = 'horn sing describe chat hockey stand credit deer emotion regular crime dance little express raw evolve make snap claim shrimp vacuum evidence phone deer snack extra boy chicken similar fiction antenna able ';

    assert.deepEqual(result, expected);
  });

  test('key can be converted and recovered', function(assert) {
    const mnemonic = mnemonicFromNaClBoxPrivateKey(samplePrivateKey);
    const result = naclBoxPrivateKeyFromMnemonic(mnemonic);

    assert.deepEqual(result, samplePrivateKey);
  });

  test ('toUint11Array | converts | 32 (8 bits)', function(assert) {
    const result = toUint11Array(numbers['32']);
    const expected = [32];

    assert.deepEqual(result, expected);
  });

  test ('toUint11Array | converts | 2048 (12 bits)', function(assert) {
    const result = toUint11Array(numbers['2048']);
    const expected = [8, 0];

    assert.deepEqual(result, expected);
  });

  test ('toUint11Array | converts | 4096 (13 bits)', function(assert) {
    const result = toUint11Array(numbers['4096']);
    const expected = [16, 0];

    assert.deepEqual(result, expected);
  });

  test ('toUint11Array | converts | 7331 (13 bits)', function(assert) {
    const result = toUint11Array(numbers['7331']);
    const expected = [1187, 3];

    assert.deepEqual(result, expected);
  });

  test('toUint11Array | converts | private key', function(assert) {
    const result = toUint11Array(samplePrivateKey);
    const expected = [
      876, 1610, 476, 310, 867, 1700, 408, 458,
      582, 1446, 412, 442, 1044, 646, 1428, 625,
      1076, 1642, 333, 1593, 1924, 622, 1308, 458,
      1640, 648, 213, 317, 1607, 686, 78, 2];

    assert.deepEqual(result, expected);
  });

});
