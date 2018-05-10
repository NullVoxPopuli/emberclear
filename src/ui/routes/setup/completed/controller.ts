import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import { mnemonicFromNaClBoxPrivateKey } from 'emberclear/src/utils/mnemonic/utils';
import IdentityService from 'emberclear/services/identity/service';


export default class SetupCompletedController extends Controller {
  @service identity!: IdentityService;
  @service i18n!: I18n;

  @computed('identity.privateKey')
  get mnemonic() {
    const key = this.identity.privateKey;

    if (!key) { return this.i18n.t('services.crypto.keyGenFailed'); }

    return mnemonicFromNaClBoxPrivateKey(key);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'setup-completed': SetupCompletedController;
  }
}
