import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import RelayConnection from 'emberclear/services/relay-connection';
import RedirectManager from 'emberclear/services/redirect-manager/service';
import Message from 'emberclear/data/models/message/model';

import { disableInFastboot } from 'emberclear/src/utils/decorators';

export interface IModel {
  messages: Message[]
}

export default class ChatRoute extends Route {
  @service relayConnection!: RelayConnection;
  @service identity!: IdentityService;
  @service redirectManager!: RedirectManager;

  @disableInFastboot
  beforeModel() {
    // identity should be loaded from application route
    if (this.identity.isLoggedIn) {
      this.redirectManager.evaluate();
      return;
    }

    // no identity, need to create one
    this.transitionTo('setup');
  }

  @disableInFastboot({ default: { messages: [] } })
  async model() {
    const messages = await this.store.findAll('message', {
      backgroundReload: true,
      include: 'sender'
    });

    return { messages };
  }

  @disableInFastboot
  afterModel() {
    this.relayConnection.connect();
  }
}
