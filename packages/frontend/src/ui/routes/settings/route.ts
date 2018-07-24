import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import { disableInFastboot } from 'emberclear/src/utils/decorators';

import IdentityService from 'emberclear/services/identity/service';

export default class SettingsRoute extends Route {
  @service identity!: IdentityService
  @service fastboot!: FastBoot;


  // ensure we are allowed to be here
  @disableInFastboot
  async beforeModel() {
    const exists = await this.identity.exists();

    if (!exists) {
      this.transitionTo('setup');
      return;
    }
  }
}
