import Ember from 'ember';
import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import { Status } from '@emberclear/local-account';

import type StoreService from '@ember-data/store';
import type { Contact } from '@emberclear/local-account';
import type { MessageDispatcher, MessageFactory } from '@emberclear/networking';

const THIRTY_SECONDS = 30000;

export default class ContactsOnlineChecker extends Service {
  @service declare store: StoreService;
  @service('messages/dispatcher') declare dispatcher: MessageDispatcher;
  @service('messages/factory') declare messageFactory: MessageFactory;

  @task({ withTestWaiter: true })
  async checkOnlineStatus() {
    if (Ember.testing) return;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      await timeout(THIRTY_SECONDS);

      const ping = this.messageFactory.buildPing();

      this.store
        .peekAll('contact')
        .filter((contact: Contact) => contact.onlineStatus !== Status.OFFLINE)
        .forEach((contact) => {
          return taskFor(this.dispatcher.sendToUser).perform(ping, contact);
        });
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'contacts/online-checker': ContactsOnlineChecker;
  }
}
