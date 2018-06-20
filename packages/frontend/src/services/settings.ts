import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';

import IdentityService from 'emberclear/services/identity/service';

import {
  objectToDataURL, toHex, fromHex
} from 'emberclear/src/utils/string-encoding';

import { derivePublicKey } from 'emberclear/src/utils/nacl/utils';

export default class Settings extends Service {
  @service identity!: IdentityService;

  @computed('identity.privateKey', 'identity.publicKey')
  get downloadUrl() {
    const { name, publicKey, privateKey } = this.identity;

    if (!privateKey) return;
    if (!publicKey) return;

    const toDownload = {
      version: 1,
      name,
      privateKey:  toHex(privateKey),
    }

    return objectToDataURL(toDownload);
  }

  async import(settings: string) {
    const json = JSON.parse(settings);
    const { name, privateKey: privateKeyHex } = json;

    const privateKey = fromHex(privateKeyHex);
    const publicKey = await derivePublicKey(privateKey);

    this.identity.setIdentity(
      name,
      privateKey,
      publicKey
    );

    // TODO: the actual settings
  }

};


// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'settings': Settings
  }
};
