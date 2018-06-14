import Component from '@ember/component';

import { action } from '@ember-decorators/object';

const fakeIdentity = `{
  "name": "fake name",
  "publicKey": "fake NaCl public key"
}`

export default class AddModal extends Component {
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
}
