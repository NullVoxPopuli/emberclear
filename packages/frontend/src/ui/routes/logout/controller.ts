import Controller from '@ember/controller';
import localforage from 'localforage';
import { action } from '@ember-decorators/object';


export default class LogoutController extends Controller {
  @action
  logout(this: LogoutController) {
    this.store.unloadAll('identity');
    localforage.clear();

    this.transitionToRoute('application');
  }
}
