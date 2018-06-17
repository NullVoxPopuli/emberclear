import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';

export default class SettingsRoute extends Route {
  @service identity!: IdentityService
  @service fastboot!: FastBoot;


  // ensure we are allowed to be here
  async beforeModel() {
    if (this.fastboot.isFastBoot) return;

    const exists = await this.identity.exists();

    if (!exists) {
      this.transitionTo('setup');
      return;
    }
  }
}
