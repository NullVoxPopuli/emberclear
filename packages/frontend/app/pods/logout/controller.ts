import Controller from '@ember/controller';
import localforage from 'localforage';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import CurrentUserService from 'emberclear/services/current-user';

export default class LogoutController extends Controller {
  @service currentUser!: CurrentUserService;

  @action
  logout(this: LogoutController) {
    this.currentUser.record = undefined;

    this.store.unloadAll('user');
    this.store.unloadAll('contact');
    this.store.unloadAll('identity');
    this.store.unloadAll('channel');

    localforage.clear();
    localStorage.clear();

    this.transitionToRoute('application');
  }
}
