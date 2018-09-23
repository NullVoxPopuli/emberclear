import DS from 'ember-data';
import Component from '@ember/component';

import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import { fromHex } from 'emberclear/src/utils/string-encoding';

const fakeIdentity = `{
  "name": "fake name",
  "publicKey": "fake NaCl public key"
}`

export default class AddModal extends Component {
  @service('notifications') toast!: Toast;
  @service store!: DS.Store;

  identityToImport = '';
  scanning = false;
  placeholder = fakeIdentity;
  close!: () => void;

  @action
  toggleScanning(this: AddModal) {
    this.set('scanning', !this.scanning);
  }

  @action
  async importIdentity(e: Event) {
    e.preventDefault();

    const identity = JSON.parse(this.identityToImport)

    await this.tryCreate(identity);

    this.close();

  }

  @action
  async onScan(this: AddModal, identityJson: string) {
    const identity = JSON.parse(identityJson);

    await this.tryCreate(identity);

    this.set('scanning', false);

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
