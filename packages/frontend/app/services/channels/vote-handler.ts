import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import VoteVerifier from './vote-verifier';
import FindOrCreateChannelService from './find-or-create';
import { VOTE_ACTION } from 'emberclear/models/vote-chain';
import { identityEquals, identitiesIncludes } from 'emberclear/utils/identity-comparison';
import Channel from 'emberclear/models/channel';
import { isVoteCompleted, isVoteCompletedPositive } from './-utils/vote-completion';
import ChannelContextChain from 'emberclear/models/channel-context-chain';
import Vote from 'emberclear/models/vote';
import { saveChannel, saveVote } from './-utils/channel-saver';

export default class ReceivedChannelVoteHandler extends Service {
  @service store!: StoreService;
  @service('channels/vote-verifier') voteVerifier!: VoteVerifier;
  @service('channels/find-or-create') findOrCreator!: FindOrCreateChannelService;

  public async handleChannelVote(message: Message, raw: StandardMessage) {
    let existingChannel = await this.findOrCreator.findOrCreateChannel(raw.channelInfo);
    if (identitiesIncludes(existingChannel?.contextChain.members.toArray(), message.sender!)) {
      let sentVote = message.metadata as StandardVote;
      let existingVote = await this.findOrCreator.findOrCreateVote(sentVote);

      if (existingVote !== undefined) {
        let voteChain = await this.findOrCreator.findOrCreateVoteChain(sentVote.voteChain);

        // when the sender tries to vote for somebody else or vote is invalid
        if (
          sentVote.voteChain.key.id !== raw.sender.uid ||
          !(await this.voteVerifier.isValid(voteChain!)) ||
          this.isAnActiveVote(existingChannel, existingVote!)
        ) {
          await this.findOrCreator.unloadVoteChain(voteChain!);
          return message;
        }

        // when it is a new vote, add this to the channel votes
        if (!existingChannel.activeVotes.find((vote) => vote.id === existingVote!.id)) {
          existingChannel.activeVotes.pushObject(existingVote);
          await saveChannel(existingChannel);
        }

        // when this is not a new vote, overwrite existing vote entry
        if (existingVote.voteChain.id !== voteChain!.id) {
          existingVote.voteChain = voteChain!;
        }
        await saveVote(existingVote);

        // update user context
        if (isVoteCompleted(existingVote.voteChain, existingChannel.contextChain.admin)) {
          if (isVoteCompletedPositive(existingVote.voteChain, existingChannel.contextChain.admin)) {
            await this.updateContextChain(existingChannel, existingVote);
          }
          let newActiveVotes = existingChannel.activeVotes.filter(
            (activeVote) => activeVote.id === existingVote!.id
          );
          existingChannel.activeVotes = newActiveVotes;
          await saveChannel(existingChannel);
        }
      }
    }
    return message;
  }

  private async updateContextChain(channel: Channel, vote: Vote) {
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
    await saveChannel(channel);
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

  private isAnActiveVote(channel: Channel, vote: Vote): boolean {
    return channel.activeVotes
      .toArray()
      .some(
        (activeVote) =>
          activeVote.id !== vote.id &&
          identityEquals(activeVote.voteChain.target, vote.voteChain.target) &&
          activeVote.voteChain.action === vote.voteChain.action
      );
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/vote-handler': ReceivedChannelVoteHandler;
  }
}
