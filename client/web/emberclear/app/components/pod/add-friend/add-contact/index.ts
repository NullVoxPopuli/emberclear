import StoreService from '@ember-data/store';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { action } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency-decorators';

import ContactManager from 'emberclear/services/contact-manager';
import CurrentUserService from 'emberclear/services/current-user';
import { taskFor } from 'emberclear/utils/ember-concurrency';

export default class AddModal extends Component {
  @service toast!: Toast;
  @service currentUser!: CurrentUserService;
  @service store!: StoreService;
  @service contactManager!: ContactManager;

  @tracked scanning = false;

  @reads('currentUser.isLoggedIn') isLoggedIn!: boolean;

  get publicIdentity() {
    if (!this.isLoggedIn) return {};

    const { name, uid } = this.currentUser;

    return { name, publicKey: uid };
  }

  get url() {
    return this.currentUser.shareUrl;
  }

  @action
  toggleScanning() {
    this.scanning = !this.scanning;
  }

  @task
  async handleScan(identityJson: string) {
    try {
      const identity = JSON.parse(identityJson);

      await this.tryCreate(identity);
    } catch (e) {
      this.toast.error(e);
    }

    this.scanning = false;
  }

  @action
  onScan(json: string) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.handleScan).perform(json);
  }

  async tryCreate(identity: IdentityJson) {
    const { name, publicKey } = identity;

    if (!name || !publicKey) {
      this.toast.error('Scan did not contain required information. Please try again.');
      console.error(identity);

      return;
    }

    let exists = this.store.peekRecord('contact', publicKey);

    if (exists) {
      this.toast.info('Friend already added!');

      return;
    }

    await this.contactManager.create(publicKey, name);

    this.toast.info(`${identity.name || 'Friend'} added!`);
  }
}
