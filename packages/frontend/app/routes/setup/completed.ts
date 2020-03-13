import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

import CurrentUserService from 'emberclear/services/current-user';
import { ensureAtLeastOneContact } from 'emberclear/utils/data/required-data';

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

    await ensureAtLeastOneContact(getOwner(this));
  }
}
