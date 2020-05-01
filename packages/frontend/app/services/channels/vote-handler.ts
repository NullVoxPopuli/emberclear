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
    // check if channel exists
    let existingChannel = await this.findOrCreator.findOrCreateChannel(raw.channelInfo);
    // check if sender is in channel
    if (existingChannel?.members.contains(message.sender!)) {
      let sentVote = message.metadata as StandardVote;
      let existingVote = undefined;

      try {
        existingVote = await this.store.findRecord('vote', sentVote.id);
      } catch (e) {
        // TODO create vote record and assign
      }

      if (existingVote !== undefined) {
        let channelVote = existingChannel.activeVotes.find(
          (activeVote) => activeVote.id === sentVote.id
        );
        let voteChain = await this.findOrCreator.findOrCreateVoteChain(sentVote.voteChain);

        if (voteChain !== undefined && !this.voteVerifier.verify(voteChain)) {
          // TODO
        }
        // add vote to channel context
        channelVote?.previousVoteChain;
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
