import Ember from 'ember';
import StoreService from '@ember-data/store';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';

import Contact, { Status } from 'emberclear/models/contact';
import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import MessageFactory from 'emberclear/services/messages/factory';
import { taskFor } from 'emberclear/utils/ember-concurrency';

const THIRTY_SECONDS = 30000;

export default class ContactsOnlineChecker extends Service {
  @service store!: StoreService;
  @service('messages/dispatcher') dispatcher!: MessageDispatcher;
  @service('messages/factory') messageFactory!: MessageFactory;

  @task({ withTestWaiter: true })
  *checkOnlineStatus() {
    if (Ember.testing) return;

    while (true) {
      yield timeout(THIRTY_SECONDS);

      const ping = this.messageFactory.buildPing();

      this.store
        .peekAll('contact')
        .filter((contact: Contact) => contact.onlineStatus !== Status.OFFLINE)
        .forEach((contact) => {
          taskFor(this.dispatcher.sendToUser).perform(ping, contact);
        });
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'contacts/online-checker': ContactsOnlineChecker;
  }
}
