import Service, { inject as service } from '@ember/service';
import ChannelContextChain from 'emberclear/models/channel-context-chain';
import VoteChain, { VOTE_ACTION } from 'emberclear/models/vote-chain';
import VoteVerifier from 'emberclear/services/channels/vote-verifier';
import Identity from 'emberclear/models/identity';
import { identityEquals, identitiesIncludes } from 'emberclear/utils/identity-comparison';

export default class ChannelVerifier extends Service {
  @service('channels/vote-verifier') voteVerifier!: VoteVerifier;

  async isValidChain(channel: ChannelContextChain): Promise<boolean> {
    if (channel.previousChain === undefined) {
      return this.isValidSingleChain(channel);
    }

    let somethingWrongWithPastOrSupportingVote =
      !(await this.isValidChain(channel.previousChain)) ||
      !(await this.voteVerifier.isValid(channel.supportingVote)) ||
      !this.isVoteCompletedPositive(channel.supportingVote, channel.previousChain.admin);

    if (somethingWrongWithPastOrSupportingVote) {
      return false;
    }

    switch (channel.supportingVote.action) {
      case VOTE_ACTION.ADD:
        return this.isAddValid(channel);
      case VOTE_ACTION.PROMOTE:
        return this.isPromoteValid(channel);
      case VOTE_ACTION.REMOVE:
        return this.isRemoveValid(channel);
      default:
        return false;
    }
  }

  private isValidSingleChain(channel: ChannelContextChain): boolean {
    return !(
      channel.admin === undefined ||
      channel.members.length !== 1 ||
      !identityEquals(channel.members.objectAt(0)!, channel.admin)
    );
  }

  private isVoteCompletedPositive(vote: VoteChain, admin: Identity): boolean {
    if (
      vote.yes.length > vote.no.length + vote.remaining.length ||
      (vote.yes.length === vote.no.length + vote.remaining.length &&
        identitiesIncludes(vote.yes.toArray(), admin))
    ) {
      return true;
    }
    return false;
  }

  private getDiffs(previousMembers: Identity[], currentMembers: Identity[]) {
    let currentMembersDiff = currentMembers.filter(
      (identity) => !identitiesIncludes(previousMembers, identity)
    );
    let pastMembersDiff = previousMembers.filter(
      (identity) => !identitiesIncludes(currentMembers, identity)
    );
    return { currentMembersDiff, pastMembersDiff };
  }

  private isAddValid(channel: ChannelContextChain): boolean {
    let previousMembers = channel.previousChain.members.toArray();
    let target = channel.supportingVote.target;
    let currentMembers = channel.members.toArray();

    if (!identityEquals(channel.admin, channel.previousChain.admin)) {
      return false;
    }

    let { currentMembersDiff, pastMembersDiff } = this.getDiffs(previousMembers, currentMembers);

    if (pastMembersDiff.length > 0) {
      return false;
    }

    if (currentMembersDiff.length === 1 && currentMembersDiff[0] === target) {
      return true;
    }
    return false;
  }

  private isPromoteValid(channel: ChannelContextChain): boolean {
    let previousMembers = channel.previousChain.members.toArray();
    let target = channel.supportingVote.target;
    let currentMembers = channel.members.toArray();

    let { currentMembersDiff, pastMembersDiff } = this.getDiffs(previousMembers, currentMembers);

    if (pastMembersDiff.length > 0 || currentMembersDiff.length > 0) {
      return false;
    }

    if (identityEquals(channel.admin, target)) {
      return true;
    }
    return false;
  }

  private isRemoveValid(channel: ChannelContextChain): boolean {
    let previousMembers = channel.previousChain.members.toArray();
    let target = channel.supportingVote.target;
    let currentMembers = channel.members.toArray();

    if (!identityEquals(channel.admin, channel.previousChain.admin)) {
      return false;
    }

    let { currentMembersDiff, pastMembersDiff } = this.getDiffs(previousMembers, currentMembers);

    if (currentMembersDiff.length > 0) {
      return false;
    }

    if (pastMembersDiff.length === 1 && pastMembersDiff[0] === target) {
      return true;
    }
    return false;
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/channel-verifier': ChannelVerifier;
  }
}
