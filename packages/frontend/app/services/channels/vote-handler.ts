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
      let existingVote = await this.findOrCreator.findOrCreateVote(sentVote);

      if (existingVote !== undefined) {
        //TODO if existingVote isn't a member of active Votes, add it

        let voteChain = await this.findOrCreator.findOrCreateVoteChain(sentVote.voteChain);

        if (!this.voteVerifier.verify(voteChain!)) {
          return;
        }

        existingVote.voteChain = voteChain!;
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
