import * as nacl from './utils';
import { default as BrowserBuffer } from 'buffer';

import { module, test } from 'qunit';
import { mnemonicFromNaClBoxPrivateKey, toUint11Array } from './utils';

const Buffer = BrowserBuffer.Buffer;


module('Unit | Utility | mnemonic', function() {
  // no one use this!
  const samplePrivateKey = 'lS2wl26RcF9F2-gtCACQ6N4TsSrLx7qT9hFT5zrdW9A';

  test('converts a private key to english', function(assert) {
    const result = mnemonicFromNaClBoxPrivateKey(samplePrivateKey);
    console.log(nacl);
    assert.ok(result);
  });

  test ('toUint11Array | converts | 8 bits', function(assert) {
    const input = Uint8Array.from([32]); // 100000
    const result = toUint11Array(input);

    // 00010000
    const expected = [[false, false, true, false, false, false, false, false]];

    assert.deepEqual(result, expected);
  });

  test ('toUint11Array | converts | 11 bits', function(assert) {
    const input = new Buffer(4);
    input.writeUInt32LE(2048); // 10000000000

    const result = toUint11Array(input);

    // 00010000
    const expected = [
      [true, false, false, false,
       false, false, false, false,
       false, false, false]];

    assert.deepEqual(result, expected);
  });

  test ('toUint11Array | converts | 12 bits', function(assert) {
    const input = new Buffer(2);
    input.writeUInt32LE(4096); // 100000000000

    const result = toUint11Array(input);

    // 00010000
    const expected = [
      [false],
      [ true, false, false, false,
       false, false, false, false,
       false, false, false]
    ];

    assert.deepEqual(result, expected);
  });

});
