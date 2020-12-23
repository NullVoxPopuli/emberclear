import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type StoreService from '@ember-data/store';
import type { CurrentUserService } from '@emberclear/local-account';
import type { Message } from '@emberclear/networking';
import type { ConnectionService } from 'emberclear/networking';
import type RedirectManager from 'emberclear/services/redirect-manager';

export interface IModel {
  messages: Message[];
}

export default class ChatRoute extends Route {
  @service declare currentUser: CurrentUserService;
  @service declare redirectManager: RedirectManager;
  @service declare connection: ConnectionService;
  @service declare store: StoreService;

  async beforeModel() {
    // identity should be loaded from application route
    if (this.currentUser.isLoggedIn) {
      await this.redirectManager.evaluate();

      return;
    }

    // no identity, need to create one
    await this.transitionTo('setup');
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
