import StoreService from 'ember-data/store';
import Service from '@ember/service';
import { inject as service } from '@ember/service';

import Relay from 'emberclear/models/relay';
import ToastService from 'emberclear/services/toast';
import RelayConnection from 'emberclear/services/relay-connection';
import ContactsOnlineChecker from 'emberclear/services/contacts/online-checker';
import CurrentUserService from 'emberclear/services/current-user';

import { RelayNotSetError } from 'emberclear/utils/errors';
import ArrayProxy from '@ember/array/proxy';

export default class RelayManager extends Service {
  @service toast!: ToastService;
  @service store!: StoreService;
  @service relayConnection!: RelayConnection;
  @service('contacts/online-checker') onlineChecker!: ContactsOnlineChecker;
  @service currentUser!: CurrentUserService;

  async connect() {
    if (!(await this.canConnect())) return;
    const relay = await this.getRelay();

    this.relayConnection.setRelay(relay);
    this.relayConnection.connect();
    this.onlineChecker.checkOnlineStatus.perform();
  }

  async getRelay(): Promise<Relay> {
    const relays: ArrayProxy<Relay> = await this.store.findAll('relay');

    const sorted = relays
      .toArray()
      .filter(r => r.priority !== null && r.priority !== undefined)
      .sort(r => r.priority);

    const relay = sorted.find(r => r.priority === 1) || sorted[0];

    if (!relay) {
      this.toast.error('there are no available relays.');
      throw new RelayNotSetError();
    }

    return relay;
  }

  async getOpenGraph(url: string): Promise<OpenGraphData> {
    const relay = await this.getRelay();
    const safeUrl = encodeURIComponent(url);
    const ogUrl = `${relay.og}?url=${safeUrl}`;
    const response = await fetch(ogUrl, {
      credentials: 'omit',
      referrer: 'no-referrer',
      cache: 'no-cache',
      headers: {
        ['Accept']: 'application/json',
      },
    });

    const json = await response.json();

    return (json || {}).data;
  }

  async canConnect(): Promise<boolean> {
    return await this.currentUser.exists();
  }
}

declare module '@ember/service' {
  interface Registry {
    'relay-manager': RelayManager;
  }
}
