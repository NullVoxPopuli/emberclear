import VoteChain, { VOTE_ACTION } from 'emberclear/models/vote-chain';
import Identity from 'emberclear/models/identity';
import { convertObjectToUint8Array, toHex } from 'emberclear/utils/string-encoding';

export const VOTE_ORDERING = {
  remaining: 0,
  yes: 1,
  no: 2,
  targetKey: 3,
  action: 4,
  voterSigningKey: 5,
  previousChainSignature: 6,
} as const;

export type SortedVote = [
  Uint8Array[],
  Uint8Array[],
  Uint8Array[],
  Uint8Array,
  VOTE_ACTION,
  Uint8Array,
  Uint8Array | undefined
];

export type SortedVoteHex = [
  string[],
  string[],
  string[],
  string,
  VOTE_ACTION,
  string,
  string | undefined
];

export function generateSortedVote(vote: VoteChain): Uint8Array {
  let toReturn: SortedVoteHex = [
    toSortedPublicKeys(vote.remaining),
    toSortedPublicKeys(vote.yes),
    toSortedPublicKeys(vote.no),
    toHex(vote.target.publicKey),
    vote.action,
    toHex(vote.key.publicSigningKey),
    vote.previousVoteChain ? toHex(vote.previousVoteChain.signature) : undefined,
  ];

  return convertObjectToUint8Array<SortedVoteHex>(toReturn);
}

function toSortedPublicKeys(identities: Identity[]): string[] {
  return identities
    .map((identity) => identity.publicKey)
    .sort()
    .map((key) => toHex(key));
}
