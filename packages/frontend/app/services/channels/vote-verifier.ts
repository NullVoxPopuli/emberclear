import Service, { inject as service } from '@ember/service';
import VoteChain from 'emberclear/models/vote-chain';

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
    let toReturn = '{remaining:';
    let remainingSorted = vote.remaining
      .map((ident) => ident.publicKey)
      .sort((a, b) => (a < b ? -1 : 1));
    toReturn = toReturn + remainingSorted;
    toReturn = toReturn + ',yes:';
    let yesSorted = vote.yes.map((ident) => ident.publicKey).sort((a, b) => (a < b ? -1 : 1));
    toReturn = toReturn + yesSorted;
    toReturn = toReturn + ',no:';
    let noSorted = vote.no.map((ident) => ident.publicKey).sort((a, b) => (a < b ? -1 : 1));
    toReturn = toReturn + noSorted;
    toReturn = toReturn + ',target:' + vote.target.publicKey;
    toReturn = toReturn + ',action:' + vote.action;
    toReturn = toReturn + ',key:' + vote.key.publicKey;
    toReturn = toReturn + ',prevVoteSignature:' + vote.previousVoteChain.signature + '}';
    return toReturn;
  }
}
