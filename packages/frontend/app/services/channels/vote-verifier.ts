import Service, { inject as service } from '@ember/service';
import VoteChain from 'emberclear/models/vote-chain';
import CryptoConnector from '../workers/crypto';
import WorkersService from '../workers';
import { generateSortedVote } from './-utils/vote-sorter';
import { equalsUint8Array } from 'emberclear/utils/uint8array-equality';

export default class VoteVerifier extends Service {
  @service workers!: WorkersService;
  crypto?: CryptoConnector;

  async verify(voteToVerify: VoteChain): Promise<boolean> {
    this.connectCrypto();

    let voteToVerifyActual: Uint8Array = generateSortedVote(voteToVerify);
    let voteToVerifyActualHash: Uint8Array = await this.crypto!.hash(voteToVerifyActual);

    let voteToVerifyExpectedHash: Uint8Array = await this.crypto!.openSigned(
      voteToVerify.signature,
      voteToVerify.key.publicSigningKey
    );

    if (!equalsUint8Array(voteToVerifyActualHash, voteToVerifyExpectedHash)) {
      return false;
    }

    if (voteToVerify.previousVoteChain === undefined) {
      return true;
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
