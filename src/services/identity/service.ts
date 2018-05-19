import DS from 'ember-data';
import Service from '@ember/service';
import { isBlank, isPresent } from '@ember/utils';

import { service } from '@ember-decorators/service';
import { alias } from '@ember-decorators/object/computed';

import { generateAsymmetricKeys } from 'emberclear/src/utils/nacl/utils';
import Identity from 'emberclear/data/models/identity';

interface IdentityAttributes {
  name: string;
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

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
  @service store!: DS.Store

  record?: Identity;

  @alias('record.name') name?: string;
  @alias('record.publicKey') publicKey?: Uint8Array;
  @alias('record.privateKey') privateKey?: Uint8Array;

  async create(this: IdentityService, name: string) {
    const { publicKey, privateKey } = await generateAsymmetricKeys();

    const record = this.upsertIdentity({ name, publicKey, privateKey });

    this.set('record', record);
    this.dump();
  }

  // 1. see if record already exists
  //    1a. Yes: update
  //    2b. No: create
  upsertIdentity(attributes: IdentityAttributes) {
    const existing = this.store.peekRecord('identity', 'me');

    if (existing) {
      this.applyAttributes(attributes, existing);

      return existing;
    }

    return this.store.createRecord('identity', { id: 'me', ...attributes });
  }

  applyAttributes(attributes: IdentityAttributes, record: Identity) {
    Object.keys(attributes).forEach(attribute => {
      record.set(attribute, attributes[attribute]);
    });
  }

  exists(): boolean {
    let identity = this._identity();

    if (identity === null) return false;
    if (isBlank(identity)) return false;

    return isPresent(identity.privateKey);
  }

  load() {
    if (localStorage.identity) {
      const json = JSON.parse(localStorage.identity);

      const existing = this.store.peekRecord('identity', 'me');

      if (existing) {
        Object.keys(json).forEach(key => {
          existing.set(key, json[key]);
        });

        existing.save();
      } else {
        this.store.createRecord('identity', json);
      }

    }
  }

  dump() {
    const identity = this._identity();

    if (isBlank(identity)) return;

    const json = identity.serialize({ includeId: true });

    localStorage.identity = JSON.stringify({ id: json.data.id, ...json.data.attributes });
  }

  _identity(this: IdentityService): Identity | null {
    if (this.record === null) this.load();

    let identity = this.store.peekRecord('identity', 'me');

    this.set('record', identity);

    return identity;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'identity': IdentityService;
  }
}
