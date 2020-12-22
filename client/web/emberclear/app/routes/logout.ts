import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type { CurrentUserService } from '@emberclear/local-account';
import type Sidebar from 'emberclear/services/sidebar';

export default class LogoutRoute extends Route {
  @service declare currentUser: CurrentUserService;
  @service declare sidebar: Sidebar;

  // ensure we are allowed to be here
  async beforeModel() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.sidebar.hide();

    const exists = await this.currentUser.exists();

    if (!exists) {
      await this.transitionTo('setup');
    }
  }
}
