import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import { mnemonicFromNaClBoxPrivateKey } from 'emberclear/src/utils/mnemonic/utils';


export default class SetupCompletedRoute extends Route {
  @service identity!: IdentityService

  async model() {
    const key = this.identity.privateKey;

    if (!key) { return null; }

    return await mnemonicFromNaClBoxPrivateKey(key);
  }

  // ensure we are allowed to be here
  beforeModel() {
    if (!this.identity.exists()) {
      this.transitionTo('setup.new');
    }
  }
}
