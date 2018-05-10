import * as nacl from './utils';
import { module, test } from 'qunit';
import { mnemonicFromNaClBoxPrivateKey } from './utils';

module('Unit | Utility | mnemonic', function() {
  // no one use this!
  const samplePrivateKey = 'lS2wl26RcF9F2-gtCACQ6N4TsSrLx7qT9hFT5zrdW9A';

  test('converts a private key to english', function(assert) {
    const result = mnemonicFromNaClBoxPrivateKey(samplePrivateKey);
    console.log(nacl);
    assert.ok(result);
  });

});
