import Service, { inject as service } from '@ember/service';

export default class VoteVerifier extends Service {
    verify(voteToVerify: VoteChain): boolean {
        if(voteToVerify.previousVoteChain == undefined){
            return true;
        }

        let voteToVerifyActualString: string = this.generateSortedVoteString(voteToVerify);
        let voteToVerifyExpectedHash: string = undefined; // NaCl.sign.open(voteToVerify.signature, voteToVerify.key)

        let voteToVerifyActualHash: string = undefined // Hash voteToVerifyActualString
        if(voteToVerifyActualHash !== voteToVerifyExpectedHash){
            return false;
        }
        return this.verify(voteToVerify.previousVoteChain);
    }

    private generateSortedVoteString(vote: VoteChain) {

    }
}