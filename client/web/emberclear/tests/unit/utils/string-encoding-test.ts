import { module, test } from 'qunit';

import * as stringEncoding from 'emberclear/utils/string-encoding';

module('Unit | Utility | String Encoding', function () {
  module('toHex / fromHex', function () {
    test('converts uint8array and back', function (assert) {
      const msgAsUint8 = Uint8Array.from([104, 101, 108, 108, 111]); // hello

      const hex = stringEncoding.toHex(msgAsUint8);
      const original = stringEncoding.fromHex(hex);

      assert.deepEqual(original, msgAsUint8);
    });
  });

  module('to/from base64 string / object', function () {
    test('converts to base64 and back', function (assert) {
      const obj = { hi: 'there' };

      const base64 = stringEncoding.convertObjectToBase64String(obj);
      const original = stringEncoding.convertBase64StringToObject(base64);

      assert.deepEqual(original, obj);
    });
  });

  module('base64ToHex', function () {
    test('converts', function (assert) {
      const base64 = 'aGVsbG8gdGhlcmU='; // hello there
      const expected = '68656C6C6F207468657265';
      const result = stringEncoding.base64ToHex(base64);

      assert.equal(result, expected);
    });
  });
});
