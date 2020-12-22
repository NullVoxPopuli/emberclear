/* eslint-disable @typescript-eslint/no-floating-promises */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import CryptoConnector from '@emberclear/crypto';

import type RouterService from '@ember/routing/router-service';
import type StoreService from '@ember-data/store';
import type { CurrentUserService } from '@emberclear/local-account';
import type Settings from 'emberclear/services/settings';
import type Toast from 'emberclear/services/toast';
import type { WorkersService } from '@emberclear/crypto';

export default class LoginForm extends Component {
  @service currentUser!: CurrentUserService;
  @service settings!: Settings;
  @service toast!: Toast;
  @service router!: RouterService;
  @service store!: StoreService;
  @service workers!: WorkersService;

  @tracked mnemonic = '';
  @tracked name = '';
  @tracked hasTransferStarted = false;

  get contacts() {
    return this.store.peekAll('contact');
  }

  get isLoggedIn() {
    return this.currentUser.isLoggedIn;
  }

  @dropTask
  async login() {
    try {
      let name = this.name;
      let crypto = new CryptoConnector({ workerService: this.workers });
      let keys = await crypto.login(this.mnemonic);

      await this.currentUser.setIdentity(name, keys);

      await this.router.transitionTo('chat');
    } catch (e) {
      console.error(e);
      this.toast.error('There was a problem logging in...');
    }
  }

  @dropTask
  async uploadSettings(data: string) {
    try {
      await this.settings.import(data);

      await this.router.transitionTo('settings');
    } catch (e) {
      console.error(e);
      this.toast.error('There was a problem processing your file...');
    }
  }

  @action
  updateTransferStatus(nextValue: boolean) {
    this.hasTransferStarted = nextValue;
  }

  @action
  onChooseFile(data: string) {
    taskFor(this.uploadSettings).perform(data);
  }

  @action
  onSubmit() {
    taskFor(this.login).perform();
  }
}
