import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user/service';

import RelayManager from 'emberclear/services/relay-manager';
import RedirectManager from 'emberclear/services/redirect-manager/service';
import Message from 'emberclear/data/models/message/model';

export interface IModel {
  messages: Message[];
}

export default class ChatRoute extends Route {
  @service relayManager!: RelayManager;
  @service currentUser!: CurrentUserService;
  @service redirectManager!: RedirectManager;

  beforeModel() {
    // identity should be loaded from application route
    if (this.currentUser.isLoggedIn) {
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
