import type StoreService from '@ember-data/store';
import type { Contact, Identity, User } from '@emberclear/local-account';

interface ModelRegistry {
  contact: Contact;
  user: User;
  identity: Identity;
}

/**
 * Helper that doesn't use the same type registry as ember-data.
 *
 * the regular store.createRecord uses ember-data/types/registries/model
 * which we can't use because we allow apps to create their own definitions
 * of these models.
 *
 */
export function createRecord<Key extends keyof ModelRegistry>(
  store: StoreService,
  modelName: Key,
  attributes: Record<string, unknown>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return store.createRecord(modelName as any, attributes) as ModelRegistry[Key];
}
