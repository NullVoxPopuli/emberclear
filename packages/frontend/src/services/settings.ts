import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';

import IdentityService from 'emberclear/services/identity/service';
// import ContactManager from 'emberclear/services/contact-manager';

import {
  objectToDataURL, toHex, fromHex
} from 'emberclear/src/utils/string-encoding';

import { derivePublicKey } from 'emberclear/src/utils/nacl/utils';

export default class Settings extends Service {
  @service identity!: IdentityService;
  // @service contactManager!: ContactManager;

  @computed('identity.privateKey', 'identity.publicKey')
  get downloadUrl() {
    const { name, publicKey, privateKey } = this.identity;

    if (!privateKey) return;
    if (!publicKey) return;

    // TODO: extract the generation of downloadUrl to an async function
    //       and don't actually have the settings rendered on the page when
    //       visiting. This will also enable us to provide a modal
    //       for optional encryption of the settings via password.
    // const contacts = this.contactManager.allContacts();

    const toDownload = {
      version: 1,
      name,
      privateKey: toHex(privateKey),
      contacts: []
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
}


// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'settings': Settings
  }
}
