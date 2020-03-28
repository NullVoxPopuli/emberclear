import Service from '@ember/service';
import localforage from 'localforage';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import CurrentUserService from 'emberclear/services/current-user';
import ConnectionService from 'emberclear/services/connection';

export default class SessionService extends Service {
  @service currentUser!: CurrentUserService;
  @service connection!: ConnectionService;
  @service store!: StoreService;

  @action
  async logout() {
    this.connection.disconnect();
    this.currentUser.record = undefined;

    this.store.unloadAll();

    localforage.clear();
    localStorage.clear();
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    session: SessionService;
  }
}
