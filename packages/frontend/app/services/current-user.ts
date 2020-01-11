import { run } from '@ember/runloop';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';

import { inject as service } from '@ember/service';

import ENV from 'emberclear/config/environment';
import { toHex } from 'emberclear/utils/string-encoding';
import StoreService from '@ember-data/store';
import User from 'emberclear/models/user';
import WorkersService from './workers';
import CryptoConnector from './workers/crypto';

export const currentUserId = 'me';

// The purpose of this service is to be an interface that
// handles syncing between the data store and persistent localstorage.
//
// if the identity doesn't already exist in the store, it will try
// try to be loaded from localstorage.
// if the identity does exist in in teh store, localstorage will
// overwrite what is in the store.
// the only time the localstorage copy of the identity is written to
// is upon update and initial creation of the identity data.
export default class CurrentUserService extends Service {
  @service workers!: WorkersService;
  @service store!: StoreService;

  crypto?: CryptoConnector;

  @tracked record?: User;

  // safety for not accidentally blowing away an existing identity
  @tracked allowOverride = false;

  get id() {
    if (!this.record) return;

    return this.record.id;
  }

  get name() {
    if (!this.record) return;

    return this.record.name;
  }

  get publicKey() {
    if (!this.record) return;

    return this.record.publicKey;
  }

  get privateKey() {
    if (!this.record) return;

    return this.record.privateKey;
  }

  get isLoggedIn(): boolean {
    if (!this.record) {
      return false;
    }

    return !!(this.privateKey && this.publicKey);
  }

  get uid(): string {
    if (!this.publicKey) return '';

    return toHex(this.publicKey);
  }

  get shareUrl(): string {
    const uri = `${ENV.host}/invite?name=${this.name}&publicKey=${this.uid}`;

    return encodeURI(uri);
  }

  async create(name: string): Promise<void> {
    await this.hydrateCrypto();
    const { publicKey, privateKey } = await this.crypto!.generateKeys();

    // remove existing record
    await this.store.unloadAll('user');

    await this.setIdentity(name, privateKey, publicKey);
    this.allowOverride = false;

    await this.load();
  }

  async setIdentity(name: string, privateKey: Uint8Array, publicKey: Uint8Array) {
    const record = this.store.createRecord('user', {
      id: currentUserId,
      name,
      publicKey,
      privateKey,
    });

    await record.save();

    run(() => {
      this.hydrateCrypto(record);

      this.record = record;
    });
    // this.record = record;
  }

  async exists(): Promise<boolean> {
    let identity = await this.currentUser();

    if (!identity) return false;

    return isPresent(identity.privateKey);
  }

  async ensureLoaded(): Promise<boolean> {
    return await this.exists();
  }

  async load(): Promise<User | null> {
    try {
      const existing = await this.store.findRecord('user', currentUserId, {
        backgroundReload: true,
      });

      run(() => {
        this.hydrateCrypto(existing);

        this.record = existing;
      });

      return existing;
    } catch (e) {
      // no record found
      run(() => (this.allowOverride = true));
    }

    return null;
  }

  async currentUser(): Promise<User | null> {
    if (!this.record) return await this.load();

    return this.record;
  }

  hydrateCrypto(user?: User) {
    if (this.crypto) {
      if (user) {
        this.crypto.keys = user;
      }

      return;
    }

    this.crypto = new CryptoConnector({
      workerService: this.workers,
      keys: user,
    });
  }

  async importFromKey(name: string, privateKey: Uint8Array) {
    this.hydrateCrypto();

    const publicKey = await this.crypto!.derivePublicKey(privateKey);

    await this.setIdentity(name, privateKey, publicKey);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    currentUser: CurrentUserService;
  }
}
