import Service, { inject as service } from '@ember/service';
import VoteChain from 'emberclear/models/vote-chain';
import CryptoConnector from '../workers/crypto';
import WorkersService from '../workers';
import VoteSorter from 'emberclear/services/channels/vote-sorter';

export default class VoteVerifier extends Service {
  @service workers!: WorkersService;
  @service voteSorter!: VoteSorter;
  crypto?: CryptoConnector;

  async verify(voteToVerify: VoteChain): Promise<boolean> {
    if (voteToVerify.previousVoteChain == undefined) {
      return true;
    }

    this.connectCrypto();

    let voteToVerifyActual: Uint8Array = this.voteSorter.generateSortedVote(voteToVerify);
    let voteToVerifyExpectedHash: Uint8Array = await this.crypto!.openSigned(
      voteToVerify.signature,
      voteToVerify.key.publicSigningKey
    );

    let voteToVerifyActualHash: Uint8Array = await this.crypto!.hash(voteToVerifyActual);
    if (voteToVerifyActualHash !== voteToVerifyExpectedHash) {
      return false;
    }
    return this.verify(voteToVerify.previousVoteChain);
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
