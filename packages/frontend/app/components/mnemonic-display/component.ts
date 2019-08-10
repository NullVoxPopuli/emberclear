import Component from '@ember/component';
import { inject as service } from '@ember/service';

import { mnemonicFromNaClBoxPrivateKey } from 'emberclear/src/utils/mnemonic/utils';

export default class Mnemonic extends Component {
  @service('intl') intl!: Intl;

  privateKey?: Uint8Array;
  mnemonic?: string;

  didInsertElement() {
    this.updateMnemonic(this.privateKey);
  }

  async updateMnemonic(this: Mnemonic, key?: Uint8Array) {
    let result = '';

    if (!key) {
      result = this.intl.t('services.crypto.keyGenFailed');
    } else result = await mnemonicFromNaClBoxPrivateKey(key);

    this.set('mnemonic', result);
  }
}
