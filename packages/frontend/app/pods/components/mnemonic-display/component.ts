import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import hbs from 'ember-cli-htmlbars-inline-precompile';

import { mnemonicFromNaClBoxPrivateKey } from 'emberclear/utils/mnemonic/utils';

class Mnemonic extends Component {
  @service('intl') intl!: Intl;

  @tracked privateKey?: Uint8Array;
  @tracked mnemonic?: string;

  @action
  async updateMnemonic(this: Mnemonic, key?: Uint8Array) {
    let result = '';

    if (!key) {
      result = this.intl.t('services.crypto.keyGenFailed');
    } else result = await mnemonicFromNaClBoxPrivateKey(key);

    this.mnemonic = result
      .split(/((?:\w+ ){5})/g)
      .filter(Boolean)
      .join('\n')
      .trim();
  }
}

export default setComponentTemplate(
  hbs`
  <pre data-test-mnemonic {{did-insert (fn this.updateMnemonic @privateKey)}}>
    {{this.mnemonic}}
  </pre>
`,
  Mnemonic
);
