import Ember from 'ember';
import StoreService from 'ember-data/store';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import Task from 'ember-concurrency/task';
import { task, timeout } from 'ember-concurrency';

import Contact, { STATUS } from 'emberclear/models/contact';
import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import MessageFactory from 'emberclear/services/messages/factory';

const THIRTY_SECONDS = 30000;

export default class ContactsOnlineChecker extends Service {
  @service store!: StoreService;
  @service('messages/dispatcher') dispatcher!: MessageDispatcher;
  @service('messages/factory') messageFactory!: MessageFactory;

  @task(function*(this: ContactsOnlineChecker) {
    if (Ember.testing) return;

    while (true) {
      yield timeout(THIRTY_SECONDS);

      const ping = this.messageFactory.buildPing();

      this.store
        .peekAll('contact')
        .filter((contact: Contact) => contact.onlineStatus !== STATUS.OFFLINE)
        .forEach(contact => {
          this.dispatcher.sendToUser.perform(ping, contact);
        });
    }
  })
  checkOnlineStatus!: Task;
}

declare module '@ember/service' {
  interface Registry {
    'contacts/online-checker': ContactsOnlineChecker;
  }
}
