import { generateAsymmetricKeys } from 'emberclear/src/utils/nacl/utils';

import CurrentUserService from 'emberclear/services/current-user/service';
import User from 'emberclear/data/models/user/model';

import { getService } from './get-service';
import { getStore } from './get-store';

export async function createCurrentUser(): Promise<User> {
  const store = getStore();
  const currentUserService = getService<CurrentUserService>('currentUser');

  const { publicKey, privateKey } = await generateAsymmetricKeys();

  const record = store.createRecord('user', {
    id: 'me',
    name: 'Test User',
    publicKey,
    privateKey,
  });

  await record.save();

  currentUserService.record = record;
  currentUserService.allowOverride = false;

  return record;
}

export function setupCurrentUser(hooks: NestedHooks) {
  hooks.beforeEach(async function() {
    await createCurrentUser();
  });
}
