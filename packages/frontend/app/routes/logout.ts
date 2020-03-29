import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

import Sidebar from 'emberclear/services/sidebar';

export default class LogoutRoute extends Route {
  @service currentUser!: CurrentUserService;
  @service sidebar!: Sidebar;

  // ensure we are allowed to be here
  async beforeModel() {
    this.sidebar.hide();

    const exists = await this.currentUser.exists();

    if (!exists) {
      return this.transitionTo('setup');
    }
  }
}
