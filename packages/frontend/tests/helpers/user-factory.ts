import StoreService from 'ember-data/store';

import { generateAsymmetricKeys } from 'emberclear/src/utils/nacl/utils';
import { toHex } from 'emberclear/src/utils/string-encoding';

import Identity, { STATUS } from 'emberclear/src/data/models/identity/model';

import { getService } from './get-service';

export async function attributesForUser() {
  const { publicKey, privateKey } = await generateAsymmetricKeys();
  const id = toHex(publicKey);

  return { id, publicKey, privateKey };
}

export async function buildIdentity(name: string, attributes = {}): Promise<Identity> {
  const store = getService<StoreService>('store');

  const defaultAttributes = await attributesForUser();

  const record = store.createRecord('identity', {
    name,
    onlineStatus: STATUS.OFFLINE,
    ...defaultAttributes,
    ...attributes,
  });

  return record;
}

export async function createIdentity(name: string, attributes = {}): Promise<Identity> {
  const record = await buildIdentity(name, attributes);

  await record.save();

  return record;
}
