import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import RelayManager from 'emberclear/services/relay-manager';
import RedirectManager from 'emberclear/services/redirect-manager/service';
import Message from 'emberclear/data/models/message/model';

export interface IModel {
  messages: Message[];
}

export default class ChatRoute extends Route {
  @service relayManager!: RelayManager;
  @service identity!: IdentityService;
  @service redirectManager!: RedirectManager;

  beforeModel() {
    // identity should be loaded from application route
    if (this.identity.isLoggedIn) {
      this.redirectManager.evaluate();
      return;
    }

    // no identity, need to create one
    this.transitionTo('setup');
  }

  async model() {
    const messages = await this.store.findAll('message', {
      backgroundReload: true,
      include: 'sender',
    });

    return { messages };
  }

  afterModel() {
    this.relayManager.connect();
  }
}
