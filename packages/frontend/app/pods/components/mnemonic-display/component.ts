import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import hbs from 'ember-cli-htmlbars-inline-precompile';

import { mnemonicFromNaClBoxPrivateKey } from 'emberclear/utils/mnemonic/utils';

class Mnemonic extends Component {
  @service('intl') intl!: Intl;

  @tracked privateKey?: Uint8Array;
  @tracked mnemonic?: string;

  didInsertElement() {
    this.updateMnemonic(this.privateKey);
  }

  async updateMnemonic(this: Mnemonic, key?: Uint8Array) {
    let result = '';

    if (!key) {
      result = this.intl.t('services.crypto.keyGenFailed');
    } else result = await mnemonicFromNaClBoxPrivateKey(key);

    this.mnemonic = result;
  }
}

export default Ember._setComponentTemplate(
  hbs`
  <div
    data-test-mnemonic
    class='has-background-color p-md m-t-lg m-b-lg with-border'
  >
    <div class='level-item is-size-6'>{{this.mnemonic}}</div>
  </div>
`,
  Mnemonic
);
