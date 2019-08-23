import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

export default class SetupCompletedRoute extends Route {
  @service currentUser!: CurrentUserService;

  model() {
    return this.currentUser;
  }

  // ensure we are allowed to be here
  async beforeModel() {
    const exists = await this.currentUser.exists();

    if (!exists) {
      this.transitionTo('setup.new');
    }
  }
}
