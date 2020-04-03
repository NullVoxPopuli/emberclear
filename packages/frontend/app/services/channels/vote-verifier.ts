import Service, { inject as service } from '@ember/service';
import VoteChain from 'emberclear/models/vote-chain';
import Identity from 'emberclear/models/identity';

export default class VoteVerifier extends Service {
  verify(voteToVerify: VoteChain): boolean {
    if (voteToVerify.previousVoteChain == undefined) {
      return true;
    }

    let voteToVerifyActualString: string = this.generateSortedVoteString(voteToVerify);
    let voteToVerifyExpectedHash: string = undefined; // NaCl.sign.open(voteToVerify.signature, voteToVerify.key)

    let voteToVerifyActualHash: string = undefined; // Hash voteToVerifyActualString
    if (voteToVerifyActualHash !== voteToVerifyExpectedHash) {
      return false;
    }
    return this.verify(voteToVerify.previousVoteChain);
  }

  private generateSortedVoteString(vote: VoteChain): string {
    let toReturn = [
      this.toSortedPublicKeys(vote.remaining),
      this.toSortedPublicKeys(vote.yes),
      this.toSortedPublicKeys(vote.no),
      vote.target.publicKey,
      vote.action,
      vote.key.publicKey,
      vote.previousVoteChain.signature,
    ];
    return JSON.stringify(toReturn);
  }

  private toSortedPublicKeys(identities: Identity[]) {
    return identities.map((identity) => identity.publicKey).sort();
  }
}
