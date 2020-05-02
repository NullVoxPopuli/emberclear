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

    if (voteToVerify.previousVoteChain === undefined) {
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
      identityEquals(vote.previousVoteChain!.target, vote.target) &&
      vote.action === vote.previousVoteChain!.action
    );
  }

  // Checks that the key of the signer matches the change in yes/no/remaining
  // Makes sure that a vote entails a shift of the signer from one category to another
  private isKeyMatchingVoteDiff(vote: VoteChain): boolean {
    if (!vote.previousVoteChain) {
      return (
        !identitiesIncludes(vote.remaining.toArray(), vote.key) &&
        this.isInOneButNotBoth(vote.yes.toArray(), vote.no.toArray(), vote.key)
      );
    }

    if (identitiesIncludes(vote.previousVoteChain!.yes.toArray(), vote.key)) {
      return (
        !identitiesIncludes(vote.yes.toArray(), vote.key) &&
        this.isInOneButNotBoth(vote.no.toArray(), vote.remaining.toArray(), vote.key)
      );
    } else if (identitiesIncludes(vote.previousVoteChain!.no.toArray(), vote.key)) {
      return (
        !identitiesIncludes(vote.no.toArray(), vote.key) &&
        this.isInOneButNotBoth(vote.yes.toArray(), vote.remaining.toArray(), vote.key)
      );
    } else if (identitiesIncludes(vote.previousVoteChain!.remaining.toArray(), vote.key)) {
      return (
        !identitiesIncludes(vote.remaining.toArray(), vote.key) &&
        this.isInOneButNotBoth(vote.no.toArray(), vote.yes.toArray(), vote.key)
      );
    }
    return false;
  }

  private isInOneButNotBoth(arr1: Identity[], arr2: Identity[], key: Identity): boolean {
    return (
      (identitiesIncludes(arr1, key) || identitiesIncludes(arr2, key)) &&
      !(identitiesIncludes(arr1, key) && identitiesIncludes(arr2, key))
    );
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'channels/vote-verifier': VoteVerifier;
  }
}
