import Controller from '@ember/controller';
import localforage from 'localforage';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';

import CurrentUserService from 'emberclear/services/current-user';
import ConnectionService from 'emberclear/services/connection';

export default class LogoutController extends Controller {
  @service currentUser!: CurrentUserService;
  @service connection!: ConnectionService;

  @action
  async logout(this: LogoutController) {
    this.connection.disconnect();
    this.currentUser.record = undefined;

    run(() => this.store.unloadAll());

    localforage.clear();
    localStorage.clear();

    this.transitionToRoute('application');
  }
}
