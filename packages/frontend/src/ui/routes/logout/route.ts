import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import IdentityService from 'emberclear/services/identity/service';
import Sidebar from 'emberclear/services/sidebar';

export default class LogoutRoute extends Route {
  @service identity!: IdentityService;
  @service sidebar!: Sidebar;

  // ensure we are allowed to be here
  async beforeModel() {
    this.sidebar.hide();

    const exists = await this.identity.exists();

    if (!exists) {
      this.transitionTo('setup');
    }
  }
}
