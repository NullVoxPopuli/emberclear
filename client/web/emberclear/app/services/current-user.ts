import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';

import { inject as service } from '@ember/service';

import ENV from 'emberclear/config/environment';
import { toHex } from 'emberclear/utils/string-encoding';
import type StoreService from '@ember-data/store';
import type User from 'emberclear/models/user';
import type WorkersService from './workers';
import CryptoConnector from '../utils/workers/crypto';
import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import { timeout } from 'ember-concurrency';

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
  @service declare workers: WorkersService;
  @service declare store: StoreService;

  declare crypto?: CryptoConnector;

  @tracked declare record?: User;

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

  get publicSigningKey() {
    if (!this.record) return;

    return this.record.publicSigningKey;
  }

  get privateSigningKey() {
    if (!this.record) return;

    return this.record.privateSigningKey;
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
    const { publicSigningKey, privateSigningKey } = await this.crypto!.generateSigningKeys();

    // remove existing record
    await this.store.unloadAll('user');

    await this.setIdentity(name, { privateKey, publicKey, privateSigningKey, publicSigningKey });

    await this.load();
  }

  async setIdentity(name: string, keys: KeyPair & Partial<SigningKeyPair>) {
    const record = this.store.createRecord('user', {
      id: currentUserId,
      name,
      ...keys,
    });

    await record.save();

    this.hydrateCrypto(record);

    this.record = record;
  }

  async exists(): Promise<boolean> {
    let identity = await this.currentUser();

    if (!identity) return false;

    return isPresent(identity.privateKey);
  }

  async load(): Promise<User | null> {
    try {
      const existing = await this.store.findRecord('user', currentUserId, {
        backgroundReload: true,
      });

      await this.hydrateCrypto(existing);

      this.record = existing;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      taskFor(this.migrate).perform();

      return existing;
    } catch (e) {
      // When the user doesn't exist, e is undefined???
      // why?
      // TODO: when implementing custom indexeddb adapter..
      //       don't throw undefined? lol
      if (e) {
        throw e;
      }
    }

    return null;
  }

  async currentUser(): Promise<User | null> {
    if (!this.record) return await this.load();

    return this.record;
  }

  @dropTask
  async migrate() {
    // This is a super HACK :(
    // for some reason, I can't find and update a record in the same
    // async function... why?
    await timeout(1000);

    if (!this.record || !this.crypto) {
      return;
    }

    if (!this.privateSigningKey) {
      let { publicSigningKey, privateSigningKey } = await this.crypto.generateSigningKeys();

      this.record.setProperties({
        publicSigningKey,
        privateSigningKey,
      });

      await this.record?.save();
    }
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

  async importFromKey(name: string, privateKey: Uint8Array, privateSigningKey?: Uint8Array) {
    this.hydrateCrypto();

    const publicKey = await this.crypto!.derivePublicKey(privateKey);

    let publicSigningKey;

    if (privateSigningKey) {
      publicSigningKey = await this.crypto!.derivePublicSigningKey(privateSigningKey);
    } else {
      let signingKeys = await this.crypto!.generateSigningKeys();

      publicSigningKey = signingKeys.publicSigningKey;
      privateSigningKey = signingKeys.privateSigningKey;
    }

    await this.setIdentity(name, { privateKey, publicKey, privateSigningKey, publicSigningKey });
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'current-user': CurrentUserService;
  }
}
