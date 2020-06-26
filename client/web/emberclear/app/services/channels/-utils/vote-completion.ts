import { identitiesIncludes } from 'emberclear/utils/identity-comparison';
import VoteChain from 'emberclear/models/vote-chain';
import Identity from 'emberclear/models/identity';

export function isVoteCompletedPositive(vote: VoteChain, admin: Identity): boolean {
  return (
    vote.yes.toArray().length > vote.no.toArray().length + vote.remaining.toArray().length ||
    (vote.yes.toArray().length === vote.no.toArray().length + vote.remaining.toArray().length &&
      identitiesIncludes(vote.yes.toArray(), admin))
  );
}

export function isVoteCompletedNegative(vote: VoteChain, admin: Identity): boolean {
  return (
    vote.no.toArray().length > vote.yes.toArray().length + vote.remaining.toArray().length ||
    (vote.no.toArray().length === vote.yes.toArray().length + vote.remaining.toArray().length &&
      identitiesIncludes(vote.no.toArray(), admin))
  );
}

export function isVoteCompleted(vote: VoteChain, admin: Identity): boolean {
  return isVoteCompletedNegative(vote, admin) || isVoteCompletedPositive(vote, admin);
}
