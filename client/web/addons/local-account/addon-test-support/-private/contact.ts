import { generateAsymmetricKeys } from '@emberclear/crypto/workers/crypto/utils/nacl';
import { toHex } from '@emberclear/encoding/string';
import { Status } from '@emberclear/local-account';

import { getService } from '../get-service';

import type { Contact } from '@emberclear/local-account';

export async function attributesForContact() {
  const { publicKey } = await generateAsymmetricKeys();
  const id = toHex(publicKey);

  return { id, publicKey };
}

export async function buildContact(name: string, attributes = {}): Promise<Contact> {
  const store = getService('store');

  const defaultAttributes = await attributesForContact();

  const record = store.createRecord('contact', {
    name,
    onlineStatus: Status.OFFLINE,
    ...defaultAttributes,
    ...attributes,
  });

  return record;
}

export async function createContact(name: string, attributes = {}): Promise<Contact> {
  const record = await buildContact(name, attributes);

  await record.save();

  return record;
}
