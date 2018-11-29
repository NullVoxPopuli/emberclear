import * as stringEncoding from './string-encoding';
import { module, test } from 'qunit';

module('Unit | Utility | String Encoding', function() {
  module('toString / fromString', function() {
    test('converts a sting to and back from uint8', function(assert) {
      const str = 'hello there';

      const uint8Array = stringEncoding.fromString(str);
      const original = stringEncoding.toString(uint8Array);

      assert.equal(original, str);
    });
  });

  module('toBase64 / fromBase64', function() {
    test('converts uint8array and back', async function(assert) {
      const msgAsUint8 = new Uint8Array([0, 1, 2, 3, 4]);

      const base64 = await stringEncoding.toBase64(msgAsUint8);
      const result = await stringEncoding.fromBase64(base64);

      assert.deepEqual(result, msgAsUint8);
    });
  });

  module('toHex / fromHex', function() {
    test('converts uint8array and back', function(assert) {
      const msgAsUint8 = Uint8Array.from([104, 101, 108, 108, 111]); // hello

      const hex = stringEncoding.toHex(msgAsUint8);
      const original = stringEncoding.fromHex(hex);

      assert.deepEqual(original, msgAsUint8);
    });
  });
});
