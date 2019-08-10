import StoreService from 'ember-data/store';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

import ENV from 'emberclear/config/environment';

import Task from 'ember-concurrency/task';
import ContactManager from 'emberclear/services/contact-manager';
import CurrentUserService from 'emberclear/services/current-user/service';

export default class AddModal extends Component {
  @service('notifications') toast!: Toast;
  @service currentUser!: CurrentUserService;
  @service store!: StoreService;
  @service contactManager!: ContactManager;

  @tracked scanning = false;

  @reads('currentUser.isLoggedIn') isLoggedIn!: boolean;

  @computed('currentUser.publicKey', 'currentUser.name', 'isLoggedIn')
  get publicIdentity() {
    if (!this.isLoggedIn) return {};

    const { name, uid } = this.currentUser;

    return { name, publicKey: uid };
  }

  @computed('publicIdentity')
  get url() {
    const { name, publicKey } = this.publicIdentity;
    const uri = `${ENV.host}/invite?name=${name}&publicKey=${publicKey}`;

    return encodeURI(uri);
  }

  toggleScanning(this: AddModal) {
    this.scanning = !this.scanning;
  }

  @task(function*(this: AddModal, identityJson: string) {
    const identity = JSON.parse(identityJson);

    yield this.tryCreate(identity);

    this.scanning = false;
  })
  onScan!: Task;

  onScanError(e: Error) {
    this.toast.error(e.message);
  }

  async tryCreate(identity: IdentityJson) {
    const { name, publicKey } = identity;

    if (!name || !publicKey) {
      this.toast.error('Scan did not contain required information. Please try again.');
      console.error(identity);
      return;
    }

    const exists = await this.store.findRecord('identity', publicKey);

    if (exists) {
      this.toast.info('Friend already added!');
      return;
    }

    await this.contactManager.create(publicKey, name);

    this.toast.info(`${identity.name || 'Friend'} added!`);
  }
}
