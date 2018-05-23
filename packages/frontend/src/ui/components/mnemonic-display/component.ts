import Component from '@ember/component';
import { service } from '@ember-decorators/service';

import { mnemonicFromNaClBoxPrivateKey } from 'emberclear/src/utils/mnemonic/utils';

export default class Mnemonic extends Component {
  @service i18n!: I18n;

  privateKey?: Uint8Array;
  mnemonic?: string;

  didInsertElement() {
    this.updateMnemonic(this.privateKey);
  }

  async updateMnemonic(this: Mnemonic, key?: Uint8Array) {
    // const key = this.identity.privateKey;
    let result = '';

    if (!key) { result = this.i18n.t('services.crypto.keyGenFailed'); }
    else result = await mnemonicFromNaClBoxPrivateKey(key);

    this.set('mnemonic', result);
  }
}
