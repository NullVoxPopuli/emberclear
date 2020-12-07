import Service from '@ember/service';
import localforage from 'localforage';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import type StoreService from '@ember-data/store';
import type CurrentUserService from 'emberclear/services/current-user';
import type ConnectionService from 'emberclear/services/connection';
import type RouterService from '@ember/routing/router-service';
import type WindowService from './window';

const FLAG_KEY = '_features';

export default class SessionService extends Service {
  @service declare currentUser: CurrentUserService;
  @service declare connection: ConnectionService;
  @service declare router: RouterService;
  @service declare store: StoreService;
  @service declare window: WindowService;

  @action
  async logout() {
    this.connection.disconnect();

    // clears the store after a refresh
    await localforage.clear();
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
