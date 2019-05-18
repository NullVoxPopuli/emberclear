import StoreService from 'ember-data/store';

import { generateAsymmetricKeys } from 'emberclear/src/utils/nacl/utils';
import { toHex } from 'emberclear/src/utils/string-encoding';

import { getService } from '../get-service';
import Contact, { STATUS } from 'emberclear/src/data/models/contact/model';

export async function attributesForContact() {
  const { publicKey } = await generateAsymmetricKeys();
  const id = toHex(publicKey);

  return { id, publicKey };
}

export async function buildContact(name: string, attributes = {}): Promise<Contact> {
  const store = getService<StoreService>('store');

  const defaultAttributes = await attributesForContact();

  const record = store.createRecord('contact', {
    name,
    onlineStatus: STATUS.OFFLINE,
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
