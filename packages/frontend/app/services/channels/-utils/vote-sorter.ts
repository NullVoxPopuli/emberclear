import VoteChain from 'emberclear/models/vote-chain';
import Identity from 'emberclear/models/identity';
import { convertObjectToUint8Array } from 'emberclear/utils/string-encoding';

export const VOTE_ORDERING = {
  remaining: 0,
  yes: 1,
  no: 2,
  targetKey: 3,
  action: 4,
  voterSigningKey: 5,
  previousChainSignature: 6,
};

export function generateSortedVote(vote: VoteChain): Uint8Array {
  let toReturn = [
    toSortedPublicKeys(vote.remaining),
    toSortedPublicKeys(vote.yes),
    toSortedPublicKeys(vote.no),
    vote.target.publicKey,
    vote.action,
    vote.key.publicSigningKey,
    vote.previousVoteChain?.signature,
  ];
  return convertObjectToUint8Array(toReturn);
}

function toSortedPublicKeys(identities: Identity[]): Uint8Array[] {
  return identities.map((identity) => identity.publicKey).sort();
}
