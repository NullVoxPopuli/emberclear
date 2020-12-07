import type Identity from 'emberclear/models/identity';
import { equalsUint8Array } from './uint8array-equality';

export function identitiesIncludes(identities: Identity[], identity: Identity): boolean {
  return identities.some((identityToCheck) => identityEquals(identityToCheck, identity));
}

export function identityEquals(identity1: Identity, identity2: Identity): boolean {
  return equalsUint8Array(identity1.publicKey, identity2.publicKey);
}
