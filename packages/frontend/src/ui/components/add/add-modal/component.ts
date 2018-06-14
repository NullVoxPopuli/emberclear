import Component from '@ember/component';

import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

const fakeIdentity = `{
  "name": "fake name",
  "publicKey": "fake NaCl public key"
}`

export default class AddModal extends Component {
  @service('notifications') toast!: Toast;

  identityToImport = '';
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
  onScan() {
    console.log(...arguments);
  }

  @action
  onScanError(e: Error) {
    this.toast.error(e.message);
  }
}
