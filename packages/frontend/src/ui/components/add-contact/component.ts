import DS from 'ember-data';
import Component, { tracked } from 'sparkles-component';

import { action, computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

import ENV from 'emberclear/config/environment';
import { toHex, fromHex } from 'emberclear/src/utils/string-encoding';

import Identity from 'emberclear/services/identity/service';

interface IArgs {
  isActive: boolean;
  close: () => void;
}

export default class AddModal extends Component<IArgs> {
  @service('notifications') toast!: Toast;
  @service identity!: Identity;
  @service store!: DS.Store;

  @tracked scanning = false;

  @reads('identity.isLoggedIn') isLoggedIn!: boolean;

  @computed('identity.publicKey','identity.name', 'isLoggedIn')
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

  @action
  toggleScanning(this: AddModal) {
    this.scanning = !this.scanning;
  }

  @action
  async onScan(this: AddModal, identityJson: string) {
    const identity = JSON.parse(identityJson);

    await this.tryCreate(identity);

    this.scanning = false;

    this.close();
  }

  @action
  onScanError(e: Error) {
    this.toast.error(e.message);
  }

  async tryCreate(identity: IdentityJson) {
    const { name, publicKey } = identity;
    const exists = this.store.peekRecord('identity', publicKey);

    if (exists) {
      this.toast.info('Friend already added!');
      return;
    }

    await this.store.createRecord('identity', {
      name,
      id: publicKey,
      publicKey: fromHex(publicKey)
    }).save();

    this.toast.info(`${identity.name || 'Friend'} added!`);
  }
}
