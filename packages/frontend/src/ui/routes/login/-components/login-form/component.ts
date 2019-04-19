import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

import IdentityService from 'emberclear/services/identity/service';
import Toast from 'emberclear/services/toast';
import Settings from 'emberclear/services/settings';

import { naclBoxPrivateKeyFromMnemonic } from 'emberclear/src/utils/mnemonic/utils';
import { derivePublicKey } from 'emberclear/src/utils/nacl/utils';

export default class LoginForm extends Component {
  @service identity!: IdentityService;
  @service settings!: Settings;
  @service toast!: Toast;
  @service router!: Router;

  @tracked mnemonic = '';
  @tracked name = '';
  @tracked scanning = false;

  get isLoggedIn() {
    return this.identity.isLoggedIn;
  }

  @(task(function*(this: LoginForm) {
    try {
      const name = this.name;
      const privateKey = yield naclBoxPrivateKeyFromMnemonic(this.mnemonic);
      const publicKey = yield derivePublicKey(privateKey);

      yield this.identity.setIdentity(name, privateKey, publicKey);

      this.router.transitionTo('chat');
    } catch (e) {
      console.error(e);
      this.toast.error('There was a problem logging in...');
    }
  }).drop())
  login;

  @(task(function*(this: LoginForm, data: string) {
    try {
      yield this.settings.import(data);

      this.router.transitionTo('settings');
    } catch (e) {
      console.error(e);
      this.toast.error('There was a problem processing your file...');
    }
  }).drop())
  uploadSettings;

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
