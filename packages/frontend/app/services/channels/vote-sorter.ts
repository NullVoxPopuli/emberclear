import Service from '@ember/service';
import VoteChain from 'emberclear/models/vote-chain';
import Identity from 'emberclear/models/identity';

export default class VoteSorter extends Service {
  generateSortedVote(vote: VoteChain): Uint8Array {
    let toReturn = [
      this.toSortedPublicKeys(vote.remaining),
      this.toSortedPublicKeys(vote.yes),
      this.toSortedPublicKeys(vote.no),
      vote.target.publicKey,
      vote.action,
      vote.key.publicSigningKey,
      vote.previousVoteChain?.signature,
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
    'channels/vote-sorter': VoteSorter;
  }
}
