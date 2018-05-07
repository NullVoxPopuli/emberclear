import * as nacl from './utils';
import { module, test } from 'qunit';
import { mnemonicFromNaClBoxPrivateKey } from './mnemonic';

module('Unit | Utility | mnemonic', function(hooks) {

  test('converts a private key tot english', function(assert) {
    const result = mnemonicFromNaClBoxPrivateKey('aa');

    assert.ok(result);
  });

});
