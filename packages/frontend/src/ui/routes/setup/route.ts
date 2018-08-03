import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import { disableInFastboot } from 'emberclear/src/utils/decorators';

export default class SetupIndexRoute extends Route {
  @service identity!: IdentityService;
  @service fastboot!: FastBoot;

  @disableInFastboot
  async beforeModel() {
    const exists = await this.identity.exists();

    if (exists && !this.identity.allowOverride) {
      this.transitionTo('setup.overwrite');
    }
  }
}
