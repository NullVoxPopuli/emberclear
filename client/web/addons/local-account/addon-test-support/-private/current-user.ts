import { settled } from '@ember/test-helpers';

import { generateAsymmetricKeys } from '@emberclear/crypto/workers/crypto/utils/nacl';
import { getService, getStore } from '@emberclear/test-helpers/test-support';

import type { User } from '@emberclear/local-account';

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

  currentUserService.__record__ = record;
  currentUserService.hydrateCrypto({ publicKey, privateKey });

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
