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

  public async handleInfoSyncRequest(message: Message, _raw: StandardMessage) {
    //TODO send info channel sync message back with channel context
    return message;
  }

  public async handleInfoSyncFulfill(message: Message, raw: StandardMessage) {
    let updatedChannel = await this.findOrCreator.updateOrCreateChannel(raw.channelInfo);
    let everyVoteIsValid = updatedChannel.activeVotes.every((activeVote) =>
      this.voteVerifier.isValid(activeVote.voteChain)
    );

    if (
      (await this.channelVerifier.isValidChain(updatedChannel.contextChain)) &&
      everyVoteIsValid
    ) {
      await saveChannel(updatedChannel);
    } else {
      await this.findOrCreator.unloadChannel(updatedChannel);
    }

    return message;
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/info-sync-handler': ReceivedChannelInfoSyncHandler;
  }
}
