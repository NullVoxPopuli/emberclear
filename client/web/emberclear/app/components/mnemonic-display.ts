import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { hbs } from 'ember-cli-htmlbars';
import WorkersService from 'emberclear/services/workers';
import CryptoConnector from 'emberclear/utils/workers/crypto';

type Args = {
  crypto?: CryptoConnector;
};

class Mnemonic extends Component<Args> {
  @service('intl') declare intl: Intl;
  @service declare workers: WorkersService;

  @tracked privateKey?: Uint8Array;
  @tracked mnemonic?: string;

  @action
  async updateMnemonic() {
    let result = '';
    let { crypto } = this.args;

    if (!crypto) {
      result = this.intl.t('services.crypto.keyGenFailed');
    } else {
      result = await crypto.mnemonicFromNaClBoxPrivateKey();
    }

    this.mnemonic = result
      .split(/((?:\w+ ){5})/g)
      .filter(Boolean)
      .join('\n')
      .trim();
  }
}

export default setComponentTemplate(
  hbs`
  <pre
    data-test-mnemonic
    class='wrap'
    {{did-insert this.updateMnemonic}}
  >
    {{this.mnemonic}}
  </pre>
`,
  Mnemonic
);
