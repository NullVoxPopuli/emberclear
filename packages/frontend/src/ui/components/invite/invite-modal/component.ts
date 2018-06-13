import Ember from 'ember';
import Component from '@ember/component';

import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { task } from 'ember-concurrency';

import Identity from 'emberclear/services/identity/service';
import { convertObjectToQRCodeDataURL, toHex } from 'emberclear/src/utils/string-encoding';


export default class InviteModal extends Component.extend({
  // qrCodeTask: task(function* () {
  //   let publicIdentity = this.get('publicIdentity');
  //   let qrCode = yield convertObjectToQRCodeDataURL(publicIdentity);
  //   return qrCode;
  // })
  // .drop()
  // .observes('publicIdentity'),
  //
  // qrCode: Ember.computed.reads('qrCodeTask.last.value')
}) {
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

  @reads('qrCodeTask.last.value') qrCode!: string;

  qrCodeTask = task(function * (this: InviteModal) {
    console.log("hey look at me");
    const publicIdentity = this.publicIdentity;
    const qrCode = yield convertObjectToQRCodeDataURL(publicIdentity);

    return qrCode;
  }).drop().observes('publicIdentity');


}
