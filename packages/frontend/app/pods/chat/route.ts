import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

import RedirectManager from 'emberclear/services/redirect-manager';
import Message from 'emberclear/models/message';
import ConnectionService from 'emberclear/services/connection';
import StoreService from 'ember-data/store';

export interface IModel {
  messages: Message[];
}

export default class ChatRoute extends Route {
  @service currentUser!: CurrentUserService;
  @service redirectManager!: RedirectManager;
  @service connection!: ConnectionService;
  @service store!: StoreService;

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
    this.connection.connect();
  }
}
