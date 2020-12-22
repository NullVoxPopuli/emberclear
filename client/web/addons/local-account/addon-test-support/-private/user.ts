import {
  generateAsymmetricKeys,
  generateSigningKeys,
} from '@emberclear/crypto/workers/crypto/utils/nacl';
import { toHex } from '@emberclear/encoding/string';
import { getService } from '@emberclear/test-helpers/test-support';

import type { User } from '@emberclear/local-account';

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
