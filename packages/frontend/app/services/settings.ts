import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import localforage from 'localforage';
import { PromiseMonitor, monitor } from 'ember-computed-promise-monitor';

import ContactManager from 'emberclear/services/contact-manager';
import ChannelManager from 'emberclear/services/channel-manager';
import CurrentUserService from './current-user';

import { objectToDataURL, toHex, fromHex } from 'emberclear/utils/string-encoding';

import { inLocalStorage } from 'emberclear/utils/decorators';

interface IContactJson {
  name: string | undefined;
  publicKey: undefined | string /* hex */;
}

interface IChannelJson {
  id: string;
  name: string;
}

interface ISettingsJson {
  version: number;
  name: string;
  privateKey: string; // hex
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

    Object.values(availableThemes).forEach(currentClass => {
      classList.remove(currentClass);
    });

    classList.add(themeClass);
  }

  @computed('currentUser.privateKey', 'currentUser.publicKey')
  @monitor
  get downloadUrl() {
    return this.buildData();
  }

  @computed('currentUser.privateKey', 'currentUser.publicKey')
  get settingsObject() {
    const promise = this.buildSettings();

    return new PromiseMonitor<ISettingsJson | undefined>(promise);
  }

  async import(settings: string) {
    const json = JSON.parse(settings);

    const { name, privateKey: privateKeyHex, contacts, channels } = json;

    // start by clearing everything!
    await localforage.clear();
    const privateKey = fromHex(privateKeyHex);

    await this.currentUser.importFromKey(name, privateKey);

    for await (let channel of channels) {
      await this.channelManager.findOrCreate(channel.id, channel.name);
    }

    for await (let contact of contacts) {
      if (!contact.publicKey || !contact.name) return Promise.resolve();

      await this.contactManager.findOrCreate(contact.publicKey, contact.name);
    }
  }

  async buildData(): Promise<string | undefined> {
    const toDownload = await this.buildSettings();

    return objectToDataURL(toDownload);
  }

  async buildSettings(): Promise<ISettingsJson | undefined> {
    const { name, publicKey, privateKey } = this.currentUser;

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
        publicKey: c.publicKey && toHex(c.publicKey),
      })),
      channels: channels.map(c => ({
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
