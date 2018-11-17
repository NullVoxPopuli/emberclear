import { DS } from 'ember-data';

import { generateAsymmetricKeys } from "emberclear/src/utils/nacl/utils";
import { toHex } from 'emberclear/src/utils/string-encoding';

import Identity from 'emberclear/data/models/identity/model';

import { getService } from './get-service';

export async function attributesForUser() {
  const { publicKey, privateKey } = await generateAsymmetricKeys();
  const id =toHex(publicKey);

  return { id, publicKey, privateKey };
}

export async function buildIdentity(name: string): Promise<Identity> {
  const store = getService<DS.Store>('store');

  const attributes = await attributesForUser();

  const record = store.createRecord('identity', {
    name, ...attributes
  });

  return record;
}

