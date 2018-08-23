import { DS } from 'ember-data';

import { generateAsymmetricKeys } from "emberclear/src/utils/nacl/utils";

import Identity from 'emberclear/data/models/identity/model';
import IdentityService from 'emberclear/services/identity/service';

import { getService } from './get-service';

export async function createCurrentUser(): Promise<Identity> {
  const store = getService<DS.Store>('store');
  const identityService = getService<IdentityService>('identity');

  const { publicKey, privateKey } = await generateAsymmetricKeys();

  const record = store.createRecord('identity', {
    id: 'me', name: 'Test User', publicKey, privateKey
  });

  await record.save();

  identityService.set('record', record);
  identityService.set('allowOverride', false);

  return record;
}

export function setupCurrentUser(hooks: NestedHooks) {
  hooks.beforeEach(async function() {
    await createCurrentUser();
  });
}
