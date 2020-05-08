import { identitiesIncludes } from 'emberclear/utils/identity-comparison';
import VoteChain from 'emberclear/models/vote-chain';
import Identity from 'emberclear/models/identity';

export function isVoteCompletedPositive(vote: VoteChain, admin: Identity): boolean {
  if (
    vote.yes.length > vote.no.length + vote.remaining.length ||
    (vote.yes.length === vote.no.length + vote.remaining.length &&
      identitiesIncludes(vote.yes.toArray(), admin))
  ) {
    return true;
  }
  return false;
}

export function isVoteCompletedNegative(vote: VoteChain, admin: Identity): boolean {
  if (
    vote.no.length > vote.yes.length + vote.remaining.length ||
    (vote.no.length === vote.yes.length + vote.remaining.length &&
      identitiesIncludes(vote.no.toArray(), admin))
  ) {
    return true;
  }
  return false;
}

export function isVoteCompleted(vote: VoteChain, admin: Identity): boolean {
  return isVoteCompletedNegative(vote, admin) || isVoteCompletedPositive(vote, admin);
}
