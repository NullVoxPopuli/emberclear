import * as nacl from './utils';
import { default as BrowserBuffer } from 'buffer';

import { module, test } from 'qunit';
import { mnemonicFromNaClBoxPrivateKey, toUint11Array, byteToBitArray } from './utils';
import { fromString } from 'emberclear/src/utils/string-encoding';

const Buffer = BrowserBuffer.Buffer;


module('Unit | Utility | mnemonic', function() {
  // no one use this!
  const samplePrivateKey = fromString('lS2wl26RcF9F2-gtCACQ6N4TsSrLx7qT9hFT5zrdW9A');
  // note, typed arrays are big-endian
  const numbers = {
    ['32']: new Uint8Array([32]),
    ['64']: new Uint8Array([64]),
    ['2048']: new Uint8Array([0, 8])
  }


  test('converts a private key to english', function(assert) {
    const result = mnemonicFromNaClBoxPrivateKey(samplePrivateKey);

    assert.ok(result);
  });

  test('byteToBitArray | converts | 8 as a byte', function(assert) {
    const result = byteToBitArray(8) // 0b1000
    const expected = [false, false, false, false, true, false, false, false];

    assert.deepEqual(result, expected);
  });

  test('byteToBitArray | converts | 20 as a byte', function(assert) {
    const result = byteToBitArray(20) // 0b10100
    const expected = [false, false, false, true, false, true, false, false];

    assert.deepEqual(result, expected);
  });

  test('byteToBitArray | converts | 31 as a byte', function(assert) {
    const result = byteToBitArray(31) // 0b11111
    const expected = [false, false, false, true, true, true, true, true];

    assert.deepEqual(result, expected);
  });


  test ('toUint11Array | converts | 8 bits', function(assert) {
    const input = new Buffer(1);
    input.writeUInt8(32) // 0b100000

    const result = toUint11Array(input);
    console.log(numbers['32'], input, result);

    // 00010000
    const expected = [[false, false, true, false, false, false, false, false]];

    assert.deepEqual(result, expected);
  });

  test ('toUint11Array | converts | 12 bits', function(assert) {
    const input = new Buffer(2);
    input.writeUInt16LE(2048); // 0b100000000000

    const result = toUint11Array(input);

    // 00010000
    const expected = [
      [
        false, false, false, false,
        false, false, false, false,
        false, false, false, true
      ],
      [
        false, false, false, false,
        false, false, false, false,
        false, false, false
      ]
    ];

    assert.deepEqual(result, expected);
  });

  test ('toUint11Array | converts | 13 bits', function(assert) {
    const input = new Buffer(5);
    input.writeUInt32LE(4096); // 0b1000000000000

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
