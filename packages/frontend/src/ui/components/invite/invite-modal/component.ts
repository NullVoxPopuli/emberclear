import Component from '@ember/component';

import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import { readOnly } from '@ember-decorators/object/computed';
import { task } from 'ember-concurrency';

import Identity from 'emberclear/services/identity/service';
import { convertObjectToQRCodeDataURL, toHex } from 'emberclear/src/utils/string-encoding';


export default class InviteModal extends Component {
  @service identity!: Identity;

  @computed('identity.publicKey', 'identity.name')
  get publicIdentity() {
    return {
      name: this.identity.name,
      publicKey: toHex(this.identity.publicKey as Uint8Array)
    };
  }

  @computed('publicIdentity')
  get identityJson() {
    return JSON.stringify(this.publicIdentity, null, 2);
  }

  qrCodeTask = task(function * (this: InviteModal) {
    console.log('start qr');
    const qr = yield convertObjectToQRCodeDataURL(this.publicIdentity);

    console.log('qr', qr);
    return qr;
  }).keepLatest().observes('publicIdentity');


  qrCodeTaskInstance(this: InviteModal) {
    return this.qrCodeTask.perform();
  }

  @readOnly('qrCodeTaskInstance.value') qrCode!: string;

}
