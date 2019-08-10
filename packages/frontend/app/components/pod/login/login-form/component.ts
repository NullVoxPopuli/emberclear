import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

import CurrentUserService from 'emberclear/services/current-user/service';

import Toast from 'emberclear/services/toast';
import Settings from 'emberclear/services/settings';

import { naclBoxPrivateKeyFromMnemonic } from 'emberclear/src/utils/mnemonic/utils';
import { derivePublicKey } from 'emberclear/src/utils/nacl/utils';
import Task from 'ember-concurrency/task';
import RouterService from '@ember/routing/router-service';

export default class LoginForm extends Component {
  @service currentUser!: CurrentUserService;
  @service settings!: Settings;
  @service toast!: Toast;
  @service router!: RouterService;

  @tracked mnemonic = '';
  @tracked name = '';
  @tracked scanning = false;

  get isLoggedIn() {
    return this.currentUser.isLoggedIn;
  }

  @(task(function*(this: LoginForm) {
    try {
      const name = this.name;
      const privateKey = yield naclBoxPrivateKeyFromMnemonic(this.mnemonic);
      const publicKey = yield derivePublicKey(privateKey);

      yield this.currentUser.setIdentity(name, privateKey, publicKey);

      this.router.transitionTo('chat');
    } catch (e) {
      console.error(e);
      this.toast.error('There was a problem logging in...');
    }
  }).drop())
  login!: Task;

  @(task(function*(this: LoginForm, data: string) {
    try {
      yield this.settings.import(data);

      this.router.transitionTo('settings');
    } catch (e) {
      console.error(e);
      this.toast.error('There was a problem processing your file...');
    }
  }).drop())
  uploadSettings!: Task;

  @action toggleScanning(this: LoginForm) {
    this.scanning = !this.scanning;
  }

  @action onScan(this: LoginForm, settingsJson: string) {
    this.uploadSettings.perform(settingsJson);
  }

  @action onScanError(e: Error) {
    this.toast.error(e.message);
  }
}
