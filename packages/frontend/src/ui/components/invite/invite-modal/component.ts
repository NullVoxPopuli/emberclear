import Component from '@ember/component';
import { schedule } from '@ember/runloop';

import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { task } from 'ember-concurrency';

import Identity from 'emberclear/services/identity/service';
import { convertObjectToQRCodeDataURL, toHex } from 'emberclear/src/utils/string-encoding';


export default class InviteModal extends Component {
  @service identity!: Identity;

  constructor() {
    super(...arguments);

    schedule("afterRender", this, function (this: InviteModal) {
      this.qrCodeTask.perform();
    });
  }

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

  @reads('qrCodeTask.last.value') qrCode!: string;

  qrCodeTask = task(function * (this: InviteModal) {
    const publicIdentity = this.publicIdentity;
    const qrCode = yield convertObjectToQRCodeDataURL(publicIdentity);

    return qrCode;
  }).drop().observes('publicIdentity');


}
