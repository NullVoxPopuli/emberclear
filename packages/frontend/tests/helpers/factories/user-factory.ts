import { getService } from '../get-service';
import { toHex } from 'emberclear/utils/string-encoding';
import { generateAsymmetricKeys, generateSigningKeys } from 'emberclear/workers/crypto/utils/nacl';
import User from 'emberclear/models/user';

export async function attributesForUser() {
  const { publicKey } = await generateAsymmetricKeys();
  const { publicSigningKey, privateSigningKey } = await generateSigningKeys();
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
