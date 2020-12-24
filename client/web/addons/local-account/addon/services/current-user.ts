import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

import { timeout } from 'ember-concurrency';
import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import { CryptoConnector } from '@emberclear/crypto';
import { toHex } from '@emberclear/encoding/string';

import type StoreService from '@ember-data/store';
import type { KeyPair, SigningKeyPair, WorkersService } from '@emberclear/crypto';
import type User from '@emberclear/local-account/models/user';

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

  declare __crypto__?: CryptoConnector;

  @tracked declare __record__?: User;

  get record() {
    assert(`current-user.record cannot be accessed until the record is loaded`, this.__record__);

    return this.__record__;
  }

  get crypto() {
    assert(
      `current-user.crypto cannot be accessed without loading the crypto web worker`,
      this.__crypto__
    );

    return this.__crypto__;
  }

  get id() {
    if (!this.__record__) return;

    return this.__record__.id;
  }

  get name() {
    if (!this.__record__) return;

    return this.__record__.name;
  }

  get publicKey() {
    if (!this.__record__) return;

    return this.record.publicKey;
  }

  get privateKey() {
    if (!this.__record__) return;

    return this.__record__.privateKey;
  }

  get publicSigningKey() {
    if (!this.__record__) return;

    return this.__record__.publicSigningKey;
  }

  get privateSigningKey() {
    if (!this.__record__) return;

    return this.__record__.privateSigningKey;
  }

  get isLoggedIn(): boolean {
    if (!this.__record__) {
      return false;
    }

    return !!(this.privateKey && this.publicKey);
  }

  get uid(): string {
    if (!this.publicKey) return '';

    return toHex(this.publicKey);
  }

  get shareUrl(): string {
    const uri = `${window.location.origin}/invite?name=${this.name}&publicKey=${this.uid}`;

    return encodeURI(uri);
  }

  async create(name: string): Promise<void> {
    await this.hydrateCrypto();

    assert(`Expected crypto to be setup`, this.__crypto__);

    const { publicKey, privateKey } = await this.__crypto__.generateKeys();
    const { publicSigningKey, privateSigningKey } = await this.__crypto__.generateSigningKeys();

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

    this.__record__ = record;
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

      this.__record__ = existing;

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
    if (!this.__record__) return await this.load();

    return this.__record__;
  }

  @dropTask
  async migrate() {
    // This is a super HACK :(
    // for some reason, I can't find and update a record in the same
    // async function... why?
    await timeout(1000);

    if (!this.__record__ || !this.__crypto__) {
      return;
    }

    if (!this.privateSigningKey) {
      let { publicSigningKey, privateSigningKey } = await this.__crypto__.generateSigningKeys();

      this.__record__.setProperties({
        publicSigningKey,
        privateSigningKey,
      });

      await this.__record__?.save();
    }
  }

  hydrateCrypto(user?: KeyPair) {
    if (this.__crypto__) {
      if (user) {
        this.__crypto__.keys = user;
      }

      return;
    }

    this.__crypto__ = new CryptoConnector({
      workerService: this.workers,
      keys: user,
    });
  }

  async importFromKey(name: string, privateKey: Uint8Array, privateSigningKey?: Uint8Array) {
    this.hydrateCrypto();

    assert(`Expected crypto to be setup`, this.__crypto__);

    const publicKey = await this.__crypto__.derivePublicKey(privateKey);

    let publicSigningKey;

    if (privateSigningKey) {
      publicSigningKey = await this.__crypto__.derivePublicSigningKey(privateSigningKey);
    } else {
      let signingKeys = await this.__crypto__.generateSigningKeys();

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
