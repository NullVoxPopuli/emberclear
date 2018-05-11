import * as nacl from './utils';

import { module, test } from 'qunit';
import { mnemonicFromNaClBoxPrivateKey, toUint11Array, naclBoxPrivateKeyFromMnemonic } from './utils';
import { fromString } from 'emberclear/src/utils/string-encoding';


module('Unit | Utility | mnemonic', function() {
  // no one use this!
  const samplePrivateKey = fromString('lS2wl26RcF9F2-gtCACQ6N4TsSrLx7qT9hFT5zrdW9A');
  // note, typed arrays are big-endian
  const numbers = {
    ['32']: new Uint8Array([32]),
    ['64']: new Uint8Array([64]),
    ['2048']: new Uint8Array([0, 8]),
    ['4096']: new Uint8Array([0, 16])
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

  test ('toUint11Array | converts | 8 bits', function(assert) {
    const result = toUint11Array(numbers['32']);

    // 00010000
    const expected = [32];

    assert.deepEqual(result, expected);
  });

  test ('toUint11Array | converts | 12 bits', function(assert) {
    const result = toUint11Array(numbers['2048']);
    const expected = [[0], [8]];

    assert.deepEqual(result, expected);
  });

  test ('toUint11Array | converts | 13 bits', function(assert) {
    const result = toUint11Array(numbers['4096']);
    const expected = [[0], [16]];


    assert.deepEqual(result, expected);
  });

  test('toUint11Array | converts | private key', function(assert) {
    const result = toUint11Array(samplePrivateKey);

    assert.deepEqual(null, result);
  });

});
