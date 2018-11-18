import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import localforage from 'localforage';
import { PromiseMonitor } from 'ember-computed-promise-monitor';

import IdentityService from 'emberclear/services/identity/service';
import ContactManager from 'emberclear/services/contact-manager';
import ChannelManager from 'emberclear/services/channel-manager';

import {
  objectToDataURL, toHex, fromHex
} from 'emberclear/src/utils/string-encoding';

import { monitor, syncToLocalStorage } from 'emberclear/src/utils/decorators';

import { derivePublicKey } from 'emberclear/src/utils/nacl/utils';

interface IContactJson {
 name: string | undefined;
 publicKey: undefined | string; /* hex */
}

interface IChannelJson {
 id: string;
 name: string;
}

interface ISettingsJson {
  version: number;
  name: string;
  privateKey: string; // hex
  contacts: IContactJson[],
  channels: IChannelJson[]
}

export default class Settings extends Service {
  @service identity!: IdentityService;
  @service contactManager!: ContactManager;
  @service channelManager!: ChannelManager;

  @syncToLocalStorage
  get hideOfflineContacts() { return false; }

  @computed('identity.privateKey', 'identity.publicKey')
  @monitor
  get downloadUrl() {
    return this.buildData();
  }


  @computed('identity.privateKey', 'identity.publicKey')
  get settingsObject() {
    const promise = this.buildSettings();

    return new PromiseMonitor<ISettingsJson | undefined>(promise);
  }

  async import(settings: string) {
    const json = JSON.parse(settings);

    const {
      name, privateKey: privateKeyHex,
      contacts, channels
    } = json;

    // start by clearing everything!
    await localforage.clear();

    const privateKey = fromHex(privateKeyHex);
    const publicKey = await derivePublicKey(privateKey);

    channels.forEach(async ( channel: IChannelJson ) => {
      return await this.channelManager.findOrCreate(channel.id, channel.name);
    });

    contacts.forEach(async ( contact: IContactJson ) => {
      if (!contact.publicKey || !contact.name) return Promise.resolve();

      return await this.contactManager.findOrCreate(contact.publicKey, contact.name);
    });

    await this.identity.setIdentity(
      name,
      privateKey,
      publicKey
    );

  }

  async buildData(): Promise<string | undefined> {
    const toDownload = await this.buildSettings();

    return objectToDataURL(toDownload);
  }

  async buildSettings(): Promise<ISettingsJson | undefined> {
    const { name, publicKey, privateKey } = this.identity;

    if (!privateKey) return;
    if (!publicKey) return;

    const contacts = await this.contactManager.allContacts();
    const channels = await this.channelManager.allChannels();

    const toDownload: ISettingsJson = {
      version: 1,
      name: name || '',
      privateKey: toHex(privateKey),
      contacts: contacts.map(c => ({
        name: c.name,
        publicKey: c.publicKey && toHex(c.publicKey)
      })),
      channels: channels.map(c => ({
        // TODO: add members list
        id: c.id, name: c.name
      }))
    };

    return toDownload;
  }
}


// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'settings': Settings
  }
}
