import Service, { inject as service } from '@ember/service';
import VoteChain from 'emberclear/models/vote-chain';
import CryptoConnector from '../../utils/workers/crypto';
import WorkersService from '../workers';
import { generateSortedVote } from './-utils/vote-sorter';
import { equalsUint8Array } from 'emberclear/utils/uint8array-equality';
import { identitiesIncludes, identityEquals } from 'emberclear/utils/identity-comparison';
import Identity from 'emberclear/models/identity';

export default class VoteVerifier extends Service {
  @service workers!: WorkersService;
  crypto?: CryptoConnector;

  async isValid(voteToVerify: VoteChain): Promise<boolean> {
    this.connectCrypto();
    if (
      !this.crypto ||
      !this.isKeyMatchingVoteDiff(voteToVerify) ||
      !this.isTargetAndActionUnchanged(voteToVerify)
    ) {
      return false;
    }

    let voteToVerifyActual: Uint8Array = generateSortedVote(voteToVerify);
    let voteToVerifyActualHash: Uint8Array = await this.crypto.hash(voteToVerifyActual);

    let voteToVerifyExpectedHash: Uint8Array = await this.crypto.openSigned(
      voteToVerify.signature,
      voteToVerify.key.publicSigningKey
    );

    if (!equalsUint8Array(voteToVerifyActualHash, voteToVerifyExpectedHash)) {
      return false;
    }

    if (!voteToVerify.previousVoteChain) {
      return true;
    }

    return this.isValid(voteToVerify.previousVoteChain);
  }

  private connectCrypto() {
    if (this.crypto) return;

    this.crypto = new CryptoConnector({
      workerService: this.workers,
    });
  }

  // Checks to make sure that target and action haven't been modified from one vote to another
  private isTargetAndActionUnchanged(vote: VoteChain): boolean {
    if (!vote.previousVoteChain) {
      return true;
    }

    return (
      identityEquals(vote.previousVoteChain.target, vote.target) &&
      vote.action === vote.previousVoteChain.action
    );
  }

  // Checks that the key of the signer matches the change in yes/no/remaining
  // Makes sure that a vote entails a shift of the signer from one category to another
  private isKeyMatchingVoteDiff(vote: VoteChain): boolean {
    if (!vote.previousVoteChain) {
      return this.isProperMoveBase(vote);
    }

    let isValid = false;

    if (identitiesIncludes(vote.previousVoteChain.yes.toArray(), vote.key)) {
      isValid = this.isProperMove(
        vote.yes.toArray(),
        vote.remaining.toArray(),
        vote.no.toArray(),
        vote.key,
        vote.previousVoteChain.yes.toArray(),
        vote.previousVoteChain.remaining.toArray(),
        vote.previousVoteChain.no.toArray()
      );
    } else if (identitiesIncludes(vote.previousVoteChain.no.toArray(), vote.key)) {
      isValid = this.isProperMove(
        vote.no.toArray(),
        vote.yes.toArray(),
        vote.remaining.toArray(),
        vote.key,
        vote.previousVoteChain.no.toArray(),
        vote.previousVoteChain.remaining.toArray(),
        vote.previousVoteChain.yes.toArray()
      );
    } else if (identitiesIncludes(vote.previousVoteChain.remaining.toArray(), vote.key)) {
      isValid = this.isProperMove(
        vote.remaining.toArray(),
        vote.yes.toArray(),
        vote.no.toArray(),
        vote.key,
        vote.previousVoteChain.remaining.toArray(),
        vote.previousVoteChain.yes.toArray(),
        vote.previousVoteChain.no.toArray()
      );
    }

    return isValid;
  }

  //Checks that the only movement of votes from the previous vote to the current vote is the voter
  private isProperMove(
    origin: Identity[],
    possibility1: Identity[],
    possibility2: Identity[],
    key: Identity,
    originPast: Identity[],
    possibility1Past: Identity[],
    possibility2Past: Identity[]
  ): boolean {
    let originDiffs = this.getVoterDiffs(originPast, origin);
    let possibility1Diffs = this.getVoterDiffs(possibility1Past, possibility1);
    let possibility2Diffs = this.getVoterDiffs(possibility2Past, possibility2);
    let isOriginDiffCorrect =
      originDiffs.currentVoterDiffs.length === 0 &&
      originDiffs.pastVoterDiffs.length === 1 &&
      identityEquals(originDiffs.pastVoterDiffs[0], key);
    let isPossibiltiesDiffsCorrect =
      ((possibility1Diffs.currentVoterDiffs.length === 1 &&
        possibility1Diffs.pastVoterDiffs.length === 0 &&
        identityEquals(possibility1Diffs.currentVoterDiffs[0], key)) ||
        (possibility2Diffs.currentVoterDiffs.length === 1 &&
          possibility2Diffs.pastVoterDiffs.length === 0 &&
          identityEquals(possibility2Diffs.currentVoterDiffs[0], key))) &&
      !(
        possibility1Diffs.currentVoterDiffs.length === 1 &&
        possibility1Diffs.pastVoterDiffs.length === 0 &&
        identityEquals(possibility1Diffs.currentVoterDiffs[0], key) &&
        possibility2Diffs.currentVoterDiffs.length === 1 &&
        possibility2Diffs.pastVoterDiffs.length === 0 &&
        identityEquals(possibility2Diffs.currentVoterDiffs[0], key)
      );

    return isOriginDiffCorrect && isPossibiltiesDiffsCorrect;
  }

  private getVoterDiffs(previousVoters: Identity[], currentVoters: Identity[]): VoterDiffs {
    let currentVoterDiff = currentVoters.filter(
      (identity) => !identitiesIncludes(previousVoters, identity)
    );
    let pastVoterDiff = previousVoters.filter(
      (identity) => !identitiesIncludes(currentVoters, identity)
    );

    return { currentVoterDiffs: currentVoterDiff, pastVoterDiffs: pastVoterDiff };
  }

  // Checks that a base vote moves the voter from remaining to either yes or no
  private isProperMoveBase(vote: VoteChain): boolean {
    return (
      !identitiesIncludes(vote.remaining.toArray(), vote.key) &&
      this.isInOneButNotBoth(vote.yes.toArray(), vote.no.toArray(), vote.key) &&
      (vote.yes.toArray().length === 1 || vote.no.toArray().length === 1) &&
      !(vote.yes.toArray().length === 1 && vote.no.toArray().length === 1)
    );
  }

  private isInOneButNotBoth(arr1: Identity[], arr2: Identity[], key: Identity): boolean {
    return (
      (identitiesIncludes(arr1, key) || identitiesIncludes(arr2, key)) &&
      !(identitiesIncludes(arr1, key) && identitiesIncludes(arr2, key))
    );
  }
}

export type VoterDiffs = {
  currentVoterDiffs: Identity[];
  pastVoterDiffs: Identity[];
};

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'channels/vote-verifier': VoteVerifier;
  }
}
