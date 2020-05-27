import { getService } from '../get-service';
import { toHex } from 'emberclear/utils/string-encoding';
import User from 'emberclear/models/user';
import { getWorker } from '../get-worker';

export async function attributesForUser() {
  let crypto = getWorker('crypto');

  const { publicKey } = await crypto.generateAsymmetricKeys();
  const { publicSigningKey, privateSigningKey } = await crypto.generateSigningKeys();
  const id = toHex(publicKey);

  return { id, publicKey, publicSigningKey, privateSigningKey };
}

export async function buildUser(name: string, attributes = {}): Promise<User> {
  const store = getService('store');

  const defaultAttributes = await attributesForUser();

  const record = store.createRecord('user', {
    name,
    ...defaultAttributes,
    ...attributes,
  });

  return record;
}

export async function createUser(name: string, attributes = {}): Promise<User> {
  const record = await buildUser(name, attributes);

  await record.save();

  return record;
}
