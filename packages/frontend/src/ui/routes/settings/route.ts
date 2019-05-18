import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import IdentityService from 'emberclear/services/identity/service';

export default class SettingsRoute extends Route {
  @service identity!: IdentityService;

  async beforeModel() {
    const exists = await this.identity.exists();

    if (!exists) {
      this.transitionTo('setup');
      return;
    }
  }
}
