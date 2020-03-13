import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

export default class SettingsRoute extends Route {
  @service currentUser!: CurrentUserService;

  async beforeModel() {
    // don't need to login, if we are already logged in
    const exists = await this.currentUser.exists();

    if (exists) {
      this.transitionTo('/');
    }
  }
}
