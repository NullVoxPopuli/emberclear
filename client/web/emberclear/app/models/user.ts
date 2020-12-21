import { attr } from '@ember-data/model';

import Identity from './identity';

import type { KeyPair, SigningKeyPair } from '@emberclear/crypto';

/**
 * Identical to the @emberclear/local-account use
 * except that it inherits from a different base class
 */
export default class User extends Identity implements Partial<KeyPair>, Partial<SigningKeyPair> {
  @attr() privateKey!: Uint8Array;
  @attr() privateSigningKey!: Uint8Array;
}
