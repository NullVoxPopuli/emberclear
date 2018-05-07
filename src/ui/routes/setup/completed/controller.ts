import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import { mnemonicFromNaClBoxPrivateKey } from 'emberclear/src/utils/mnemonic/utils';

export default class SetupCompletedController extends Controller {
  @service('identity') identity;

  @computed('identity.privateKey')
  get mnemonic() {
    const key = this.identity.privateKey;

    return mnemonicFromNaClBoxPrivateKey(key);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'setup-completed': SetupCompletedController;
  }
}
