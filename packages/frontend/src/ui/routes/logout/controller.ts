import Controller from '@ember/controller';
import localforage from 'localforage';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import IdentityService from 'emberclear/services/identity/service';

export default class LogoutController extends Controller {
  @service identity!: IdentityService;

  @action
  logout(this: LogoutController) {
    this.identity.set('record', undefined);
    this.store.unloadAll('identity');
    this.store.unloadAll('contact');
    this.store.unloadAll('channel');

    localforage.clear();
    localStorage.clear();

    this.transitionToRoute('application');
  }
}
