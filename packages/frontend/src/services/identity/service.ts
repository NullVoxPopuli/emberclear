import DS from 'ember-data';
import { run } from '@ember/runloop';
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isPresent } from '@ember/utils';

import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

import { generateAsymmetricKeys } from 'emberclear/src/utils/nacl/utils';
import { toHex } from 'emberclear/src/utils/string-encoding';
import Identity from 'emberclear/data/models/identity/model';

// The purpose of this service is to be an interface that
// handles syncing between the data store and persistent localstorage.
//
// if the identity doesn't already exist in the store, it will try
// try to be loaded from localstorage.
// if the identity does exist in in teh store, localstorage will
// overwrite what is in the store.
// the only time the localstorage copy of the identity is written to
// is upon update and initial creation of the identity data.
export default class IdentityService extends Service {
  @service store!: DS.Store;

  @tracked record?: Identity;

  // safety for not accidentally blowing away an existing identity
  @tracked allowOverride = false;

  @reads('record.id') id?: string;
  @reads('record.name') name?: string;
  @reads('record.publicKey') publicKey?: Uint8Array;
  @reads('record.privateKey') privateKey?: Uint8Array;

  get isLoggedIn(): boolean {
    return !!(this.privateKey && this.publicKey);
  }

  get uid(): string {
    if (!this.publicKey) return '';

    return toHex(this.publicKey);
  }

  async create(this: IdentityService, name: string): Promise<void> {
    const { publicKey, privateKey } = await generateAsymmetricKeys();

    // remove existing record
    await this.store.unloadAll('identity');

    await this.setIdentity(name, privateKey, publicKey);
    this.allowOverride = false;

    await this.load();
  }

  async setIdentity(
    this: IdentityService,
    name: string,
    privateKey: Uint8Array,
    publicKey: Uint8Array
  ) {
    const record = this.store.createRecord('identity', {
      id: 'me',
      name,
      publicKey,
      privateKey,
    });

    await record.save();

    this.record = record;
  }

  async exists(): Promise<boolean> {
    let identity = await this.identity();

    if (!identity) return false;

    return isPresent(identity.privateKey);
  }

  async ensureLoaded(): Promise<boolean> {
    return await this.exists();
  }

  async load(this: IdentityService): Promise<Identity | null> {
    try {
      const existing = await this.store.findRecord('identity', 'me', { backgroundReload: true });

      run(() => (this.record = existing));

      return existing;
    } catch (e) {
      // no record found
      run(() => (this.allowOverride = true));
    }

    return null;
  }

  async identity(this: IdentityService): Promise<Identity | null> {
    if (!this.record) return await this.load();

    return this.record;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    identity: IdentityService;
  }
}
