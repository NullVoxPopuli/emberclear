import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import VoteVerifier from './vote-verifier';
import FindOrCreateChannelService from './find-or-create';
import VoteChain, { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { identityEquals } from 'emberclear/utils/identity-comparison';
import Channel from 'emberclear/models/channel';
import { isVoteCompleted, isVoteCompletedPositive } from './-utils/vote-completion';
import ChannelContextChain from 'emberclear/models/channel-context-chain';
import Vote from 'emberclear/models/vote';

export default class ReceivedChannelVoteHandler extends Service {
  @service store!: StoreService;
  @service('channels/vote-verifier') voteVerifier!: VoteVerifier;
  @service('channels/find-or-create') findOrCreator!: FindOrCreateChannelService;

  public async handleChannelVote(message: Message, raw: StandardMessage) {
    let existingChannel = await this.findOrCreator.findOrCreateChannel(raw.channelInfo);
    if (existingChannel?.members.contains(message.sender!)) {
      let sentVote = message.metadata as StandardVote;
      let existingVote = await this.findOrCreator.findOrCreateVote(sentVote);

      if (existingVote !== undefined) {
        let voteChain = await this.findOrCreator.findOrCreateVoteChain(sentVote.voteChain);

        // when the sender tries to vote for somebody else or vote is invalid
        if (
          sentVote.voteChain.key.id !== raw.sender.uid ||
          !this.voteVerifier.isValid(voteChain!) ||
          this.isAnActiveVote(existingChannel, voteChain!)
        ) {
          return message;
        }

        // when it is a new vote, add this to the channel votes
        if (!existingChannel.activeVotes.find((vote) => vote.id === existingVote!.id)) {
          existingChannel.activeVotes.push(existingVote);
          existingChannel.save();
        }

        // when this is not a new vote, overwrite existing vote entry
        if (existingVote.voteChain.id !== voteChain!.id) {
          existingVote.voteChain = voteChain!;
        }
        existingVote.save();

        // update user context
        if (isVoteCompleted(existingVote.voteChain, existingChannel.admin)) {
          if (isVoteCompletedPositive(existingVote.voteChain, existingChannel.admin)) {
            this.updateContextChain(existingChannel, existingVote);
          }
          let newActiveVotes = existingChannel.activeVotes.filter(
            (activeVote) => activeVote.id === existingVote!.id
          );
          existingChannel.activeVotes = newActiveVotes;
          existingChannel.save();
        }
      }
    }
    return message;
  }

  private updateContextChain(channel: Channel, vote: Vote) {
    let updatedContextChain: ChannelContextChain;
    switch (vote.voteChain.action) {
      case VOTE_ACTION.ADD:
        updatedContextChain = this.updateAddContextChain(channel, vote);
        break;
      case VOTE_ACTION.REMOVE:
        updatedContextChain = this.updateRemoveContextChain(channel, vote);
        break;
      case VOTE_ACTION.PROMOTE:
        updatedContextChain = this.updatePromoteContextChain(channel, vote);
        break;
      default:
        return;
    }
    channel.contextChain = updatedContextChain;
    channel.admin = channel.contextChain.admin;
    channel.members = channel.contextChain.members;
    channel.save();
  }

  private updatePromoteContextChain(channel: Channel, vote: Vote): ChannelContextChain {
    return this.store.createRecord('channelContextChain', {
      admin: vote.voteChain.target,
      members: channel.contextChain.members.toArray(),
      supportingVote: vote.voteChain,
      previousChain: channel.contextChain,
    });
  }

  private updateRemoveContextChain(channel: Channel, vote: Vote): ChannelContextChain {
    let newMembersArray = channel.contextChain.members.filter(
      (identity) => !identityEquals(identity, vote.voteChain.target)
    );
    return this.store.createRecord('channelContextChain', {
      admin: channel.contextChain.admin,
      members: newMembersArray,
      supportingVote: vote.voteChain,
      previousChain: channel.contextChain,
    });
  }

  private updateAddContextChain(channel: Channel, vote: Vote): ChannelContextChain {
    return this.store.createRecord('channelContextChain', {
      admin: channel.contextChain.admin,
      members: channel.contextChain.members.toArray().push(vote.voteChain.target),
      supportingVote: vote.voteChain,
      previousChain: channel.contextChain,
    });
  }

  private isAnActiveVote(channel: Channel, voteChain: VoteChain): boolean {
    return channel.activeVotes
      .toArray()
      .some(
        (activeVote) =>
          identityEquals(activeVote.voteChain.target, voteChain.target) &&
          activeVote.voteChain.action === voteChain.action
      );
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/vote-handler': ReceivedChannelVoteHandler;
  }
}
