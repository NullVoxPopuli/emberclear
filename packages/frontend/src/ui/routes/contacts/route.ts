import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';
import IdentityService from 'emberclear/services/identity/service';

export default class ContactsRoute extends Route {
  @service identity!: IdentityService;

  model(this: ContactsRoute) {
    const identities = this.store
      .peekAll('identity')
      .filter(identity => identity.id !== this.identity.id);

    return identities;
  }
}
