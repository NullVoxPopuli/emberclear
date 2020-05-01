import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import VoteVerifier from './vote-verifier';
import FindOrCreateChannelModelService from './find-or-create';

export default class ReceivedChannelVoteHandler extends Service {
  @service store!: StoreService;
  @service('channels/vote-verifier') voteVerifier!: VoteVerifier;
  @service('channels/find-or-create') findOrCreator!: FindOrCreateChannelModelService;

  public async handleChannelVote(message: Message, raw: StandardMessage) {
    let existingChannel = await this.findOrCreator.findOrCreateChannel(raw.channelInfo);
    if (existingChannel?.members.contains(message.sender!)) {
      let sentVote = message.metadata as StandardVote;
      let existingVote = await this.findOrCreator.findOrCreateVote(sentVote);

      if (existingVote !== undefined) {
        let voteChain = await this.findOrCreator.findOrCreateVoteChain(sentVote.voteChain);

        if (!this.voteVerifier.verify(voteChain!)) {
          return;
        }

        if (!existingChannel.activeVotes.find((vote) => vote.id === existingVote!.id)) {
          existingChannel.activeVotes.push(existingVote);
          existingChannel.save();
        }

        if (existingVote.voteChain.id !== voteChain!.id) {
          existingVote.voteChain = voteChain!;
        }
        existingVote.save();
      }
    }
    return message;
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/vote-handler': ReceivedChannelVoteHandler;
  }
}
