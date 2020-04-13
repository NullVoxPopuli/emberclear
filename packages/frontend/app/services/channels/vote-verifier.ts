import Service, { inject as service } from '@ember/service';
import VoteChain from 'emberclear/models/vote-chain';
import CryptoConnector from '../workers/crypto';
import WorkersService from '../workers';
import VoteSorter from './vote-sorter';

export default class VoteVerifier extends Service {
  @service workers!: WorkersService;
  @service('channels/vote-sorter') voteSorter!: VoteSorter;
  crypto?: CryptoConnector;

  async verify(voteToVerify: VoteChain): Promise<boolean> {
    this.connectCrypto();

    let voteToVerifyActual: Uint8Array = this.voteSorter.generateSortedVote(voteToVerify);
    let voteToVerifyActualHash: Uint8Array = await this.crypto!.hash(voteToVerifyActual);

    let voteToVerifyExpectedHash: Uint8Array = await this.crypto!.openSigned(
      voteToVerify.signature,
      voteToVerify.key.publicSigningKey
    );

    if (!this.checkVoteHashes(voteToVerifyActualHash, voteToVerifyExpectedHash)) {
      return false;
    }

    if (voteToVerify.previousVoteChain === undefined) {
      return true;
    }

    return this.verify(voteToVerify.previousVoteChain);
  }

  private checkVoteHashes(actual: Uint8Array, expected: Uint8Array): boolean {
    if (actual.length !== expected.length) {
      return false;
    }

    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) {
        return false;
      }
    }

    return true;
  }

  private connectCrypto() {
    if (this.crypto) return;

    this.crypto = new CryptoConnector({
      workerService: this.workers,
    });
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'channels/vote-verifier': VoteVerifier;
  }
}
