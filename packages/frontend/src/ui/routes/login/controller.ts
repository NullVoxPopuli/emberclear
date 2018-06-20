import Controller from '@ember/controller';
import { service } from '@ember-decorators/service';
import { alias } from '@ember-decorators/object/computed';
import { action } from '@ember-decorators/object';

import IdentityService from 'emberclear/services/identity/service';
import Notifications from 'emberclear/services/notifications/service';

import { naclBoxPrivateKeyFromMnemonic } from 'emberclear/src/utils/mnemonic/utils';
import { derivePublicKey } from 'emberclear/src/utils/nacl/utils';

export default class extends Controller {
  @service identity!: IdentityService;
  @service('notifications') flash!: Notifications;

  mnemonic = '';
  name = '';

  @alias('identity.isLoggedIn') isLoggedIn!: boolean;

  @action
  async login() {
    try {
      const name = this.name;
      const privateKey = await naclBoxPrivateKeyFromMnemonic(this.mnemonic);
      const publicKey = await derivePublicKey(privateKey);

      await this.identity.setIdentity(name, privateKey, publicKey);

      this.transitionToRoute('chat');
    } catch (e) {
      console.error(e);
      this.flash.error('There was a problem logging in...');
    }
  }
}
