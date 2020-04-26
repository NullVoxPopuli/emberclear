import Service from '@ember/service';
import localforage from 'localforage';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import CurrentUserService from 'emberclear/services/current-user';
import ConnectionService from 'emberclear/services/connection';
import RouterService from '@ember/routing/router-service';
import WindowService from './window';

const FLAG_KEY = '_features';

export default class SessionService extends Service {
  @service currentUser!: CurrentUserService;
  @service connection!: ConnectionService;
  @service router!: RouterService;
  @service store!: StoreService;
  @service window!: WindowService;

  @action
  async logout() {
    this.connection.disconnect();

    // clears the store after a refresh
    localforage.clear();
    localStorage.clear();

    // lazy way to reset all the services
    this.window.location.href = '/';
  }

  @action
  hasFeatureFlag(flag: string) {
    let searchParams = new URLSearchParams(this.router.currentURL.split('?')[1]);
    let ffs = searchParams.get(FLAG_KEY) || '';
    let hasFF = ffs.split(',').includes(flag);

    return hasFF;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    session: SessionService;
  }
}
