import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import { disableInFastboot } from 'emberclear/src/utils/decorators';

import IdentityService from 'emberclear/services/identity/service';

export default class ContactsRoute extends Route {
  @service identity!: IdentityService;

  @disableInFastboot
  async beforeModel() {
    const exists = await this.identity.exists();

    if (!exists) {
      this.transitionTo('setup');
    }
  }

  @disableInFastboot
  async model(this: ContactsRoute) {
    const identities = await this.store.findAll('identity', { backgroundReload: true });

    return { identities };
  }
}
