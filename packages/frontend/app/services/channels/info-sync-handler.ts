import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import FindOrCreateChannelService from './find-or-create';
import ChannelVerifier from './channel-verifier';
import VoteVerifier from './vote-verifier';
import { saveChannel } from './-utils/channel-saver';

export default class ReceivedChannelInfoSyncHandler extends Service {
  @service store!: StoreService;
  @service('channels/channel-verifier') channelVerifier!: ChannelVerifier;
  @service('channels/vote-verifier') voteVerifier!: VoteVerifier;
  @service('channels/find-or-create') findOrCreator!: FindOrCreateChannelService;

  public async handleInfoSyncRequest(message: Message, raw: StandardMessage) {
    //TODO send info channel sync message back with channel context
    return message;
  }

  public async handleInfoSyncFulfill(message: Message, raw: StandardMessage) {
    let updatedChannel = await this.findOrCreator.createChannel(raw.channelInfo);
    if (await this.channelVerifier.isValidChain(updatedChannel.contextChain)) {
      let existingChannel = await this.findOrCreator.findOrCreateChannel(raw.channelInfo);
      existingChannel.contextChain = updatedChannel.contextChain;
      existingChannel.members = existingChannel.contextChain.members;
      existingChannel.admin = existingChannel.contextChain.admin;
      existingChannel.activeVotes = [];
      updatedChannel.activeVotes.forEach((activeVote) => {
        if (this.voteVerifier.isValid(activeVote.voteChain)) {
          existingChannel.activeVotes.push(activeVote);
        }
      });
      await saveChannel(existingChannel);
    }
    return message;
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/info-sync-handler': ReceivedChannelInfoSyncHandler;
  }
}
