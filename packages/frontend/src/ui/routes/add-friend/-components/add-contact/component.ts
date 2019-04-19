import StoreService from 'ember-data/store';
import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';

import { action, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

import ENV from 'emberclear/config/environment';
import { fromHex } from 'emberclear/src/utils/string-encoding';

import Identity from 'emberclear/services/identity/service';

export default class AddModal extends Component {
  @service('notifications') toast!: Toast;
  @service identity!: Identity;
  @service store!: StoreService;

  @tracked scanning = false;

  @reads('identity.isLoggedIn') isLoggedIn!: boolean;

  @computed('identity.publicKey', 'identity.name', 'isLoggedIn')
  get publicIdentity() {
    if (!this.isLoggedIn) return {};

    const { name, uid } = this.identity;

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

  @task(function*(identityJson: string) {
    const identity = JSON.parse(identityJson);

    yield this.tryCreate(identity);

    this.scanning = false;
  })
  onScan;

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

    await this.store
      .createRecord('identity', {
        name,
        id: publicKey,
        publicKey: fromHex(publicKey),
      })
      .save();

    this.toast.info(`${identity.name || 'Friend'} added!`);
  }
}
