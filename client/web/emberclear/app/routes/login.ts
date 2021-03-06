import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type { WorkersService } from '@emberclear/crypto';
import type { CurrentUserService } from '@emberclear/local-account';

export default class SettingsRoute extends Route {
  @service declare currentUser: CurrentUserService;
  @service declare workers: WorkersService;

  async beforeModel() {
    // don't need to login, if we are already logged in
    const exists = await this.currentUser.exists();

    if (exists) {
      await this.transitionTo('/');
    }
  }
}
