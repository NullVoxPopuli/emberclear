import * as nacl from './utils';
import { module, test } from 'qunit';
import { mnemonicFromNaClBoxPrivateKey } from './utils';

module('Unit | Utility | mnemonic', function() {

  test('converts a private key tot english', function(assert) {
    const result = mnemonicFromNaClBoxPrivateKey('aa');
    console.log(nacl);
    assert.ok(result);
  });

});
