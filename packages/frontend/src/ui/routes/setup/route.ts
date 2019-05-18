import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user/service';

export default class SetupIndexRoute extends Route {
  @service currentUser!: CurrentUserService;

  async beforeModel() {
    const exists = await this.currentUser.exists();

    if (exists && !this.currentUser.allowOverride) {
      this.transitionTo('setup.overwrite');
    }
  }
}
