import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { inLocalStorage } from 'ember-tracked-local-storage';
import localforage from 'localforage';

import { fromHex, objectToDataURL, toHex } from '@emberclear/encoding/string';

import type { Serializable } from '@emberclear/crypto/types';
import type { Channel, Contact } from '@emberclear/local-account';
import type ChannelManager from '@emberclear/local-account/services/channel-manager';
import type ContactManager from '@emberclear/local-account/services/contact-manager';
import type CurrentUserService from '@emberclear/local-account/services/current-user';

interface IContactJson {
  name?: string;
  publicKey?: string /* hex */;
}

interface IChannelJson {
  id: string;
  name: string;
}

interface ISettingsJson {
  version: number;
  name: string;
  privateKey: string; // hex
  privateSigningKey?: string; // hex
  contacts: IContactJson[];
  channels: IChannelJson[];
}

export const THEMES = {
  midnight: 'midnight',
  default: 'default',
};

const availableThemes = {
  [THEMES.midnight]: 'midnight-theme',
  [THEMES.default]: 'default-theme',
};

export default class Settings extends Service {
  @service declare currentUser: CurrentUserService;
  @service declare contactManager: ContactManager;
  @service declare channelManager: ChannelManager;

  @inLocalStorage hideOfflineContacts = false;
  @inLocalStorage theme = THEMES.default;

  selectTheme(themeKey: string) {
    this.theme = themeKey;
    this.applyTheme();
  }

  applyTheme() {
    let themeClass = availableThemes[this.theme];
    let classList = document.body.classList;

    Object.values(availableThemes).forEach((currentClass) => {
      classList.remove(currentClass);
    });

    classList.add(themeClass);
  }

  async import(settings: string) {
    const json = JSON.parse(settings) as ISettingsJson;

    await this.importData(json);
  }

  async importData(json: ISettingsJson) {
    const {
      name,
      privateKey: privateKeyHex,
      privateSigningKey: privateSigningKeyHex,
      contacts,
      channels,
    } = json;

    // start by clearing everything!
    await localforage.clear();
    const privateKey = fromHex(privateKeyHex);

    let privateSigningKey;

    if (privateSigningKeyHex) {
      privateSigningKey = fromHex(privateSigningKeyHex);
    }

    await this.currentUser.importFromKey(name, privateKey, privateSigningKey);

    for await (let channel of channels) {
      await this.channelManager.findOrCreate(channel.id, channel.name);
    }

    await this.contactManager.import(contacts);
  }

  async buildData(): Promise<string | undefined> {
    const toDownload = await this.buildSettings();

    return objectToDataURL(toDownload);
  }

  async buildSettings(): Promise<Serializable> {
    const { name, privateKey, privateSigningKey } = this.currentUser;

    if (!privateKey) {
      throw new Error('User does not have a private key');
    }

    if (!privateSigningKey) {
      throw new Error('User does not have a signing key');
    }

    const contacts = await this.contactManager.allContacts();
    const channels = await this.channelManager.allChannels();

    const toDownload = {
      version: 1,
      name: name || '',
      privateKey: toHex(privateKey),
      privateSigningKey: toHex(privateSigningKey),
      contacts: contacts.toArray().map((c: Contact) => ({
        name: c.name,
        publicKey: c.publicKey && toHex(c.publicKey),
      })),
      channels: channels.toArray().map((c: Channel) => ({
        // TODO: add members list
        id: c.id,
        name: c.name,
      })),
    };

    return toDownload;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    settings: Settings;
  }
}
