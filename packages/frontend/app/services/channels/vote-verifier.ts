import Service, { inject as service } from '@ember/service';
import VoteChain from 'emberclear/models/vote-chain';
import Identity from 'emberclear/models/identity';
import CryptoConnector from '../workers/crypto';
import WorkersService from '../workers';

export default class VoteVerifier extends Service {
  @service workers!: WorkersService;
  crypto?: CryptoConnector;

  async verify(voteToVerify: VoteChain): Promise<boolean> {
    if (voteToVerify.previousVoteChain == undefined) {
      return true;
    }

    this.connectCrypto();

    let voteToVerifyActual: Uint8Array = this.generateSortedVote(voteToVerify);
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

  private generateSortedVote(vote: VoteChain): Uint8Array {
    let toReturn = [
      this.toSortedPublicKeys(vote.remaining),
      this.toSortedPublicKeys(vote.yes),
      this.toSortedPublicKeys(vote.no),
      vote.target.publicKey,
      vote.action,
      vote.key.publicKey,
      vote.previousVoteChain.signature,
    ];
    return new TextEncoder().encode(JSON.stringify(toReturn));
  }

  private toSortedPublicKeys(identities: Identity[]): Uint8Array[] {
    return identities.map((identity) => identity.publicKey).sort();
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'channels/vote-verifier': VoteVerifier;
  }
}
