import { generateAsymmetricKeys } from 'emberclear/workers/crypto/utils/nacl';

import type User from 'emberclear/models/user';

import { getService } from './get-service';
import { getStore } from './get-store';
import { settled } from '@ember/test-helpers';

export async function createCurrentUser(): Promise<User> {
  const store = getStore();
  const currentUserService = getService('current-user');

  const { publicKey, privateKey } = await generateAsymmetricKeys();

  const record = store.createRecord('user', {
    id: 'me',
    name: 'Test User',
    publicKey,
    privateKey,
  });

  await record.save();

  currentUserService.record = record;

  await settled();

  return record;
}

export function setupCurrentUser(hooks: NestedHooks) {
  hooks.beforeEach(async function () {
    await createCurrentUser();
  });
}

export function getCurrentUser() {
  return getService('current-user').record;
}
