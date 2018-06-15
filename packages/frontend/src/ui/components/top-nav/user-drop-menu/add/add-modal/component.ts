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

  identityToImport?: IdentityJson;
  scanning = false;
  placeholder = fakeIdentity;

  @action
  toggleScanning(this: AddModal) {
    this.set('scanning', !this.scanning);
  }

  @action
  importIdentity() {
    console.log('importing...');
  }

  @action
  async onScan(this: AddModal, identityJson: string) {
    const identity = JSON.parse(identityJson);
    const { name, publicKey } = identity;

    await this.store.createRecord('identity', {
      name,
      id: publicKey,
      publicKey: fromHex(publicKey)
    }).save();

    this.set('scanning', false);
    this.close();
  }

  @action
  onScanError(e: Error) {
    this.toast.error(e.message);
  }
}
