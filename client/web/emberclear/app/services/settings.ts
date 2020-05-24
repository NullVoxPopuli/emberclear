import Service from '@ember/service';
import { inject as service } from '@ember/service';
import localforage from 'localforage';

import ContactManager from 'emberclear/services/contact-manager';
import ChannelManager from 'emberclear/services/channel-manager';
import CurrentUserService from './current-user';

import { objectToDataURL, toHex, fromHex } from 'emberclear/utils/string-encoding';

import { inLocalStorage } from 'emberclear/utils/decorators';

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
  @service currentUser!: CurrentUserService;
  @service contactManager!: ContactManager;
  @service channelManager!: ChannelManager;

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

  async buildSettings(): Promise<ISettingsJson> {
    const { name, privateKey, privateSigningKey } = this.currentUser;

    if (!privateKey) {
      throw new Error('User does not have a private key');
    }

    if (!privateSigningKey) {
      throw new Error('User does not have a signing key');
    }

    const contacts = await this.contactManager.allContacts();
    const channels = await this.channelManager.allChannels();

    const toDownload: ISettingsJson = {
      version: 1,
      name: name || '',
      privateKey: toHex(privateKey),
      privateSigningKey: toHex(privateSigningKey),
      contacts: contacts.toArray().map((c) => ({
        name: c.name,
        publicKey: c.publicKey && toHex(c.publicKey),
      })),
      channels: channels.toArray().map((c) => ({
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
