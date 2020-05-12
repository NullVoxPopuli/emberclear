import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import FindOrCreateChannelService from './find-or-create';
import ChannelVerifier from './channel-verifier';

export default class ReceivedChannelInfoSyncHandler extends Service {
  @service store!: StoreService;
  @service('channels/channel-verifier') channelVerifier!: ChannelVerifier;
  @service('channels/find-or-create') findOrCreator!: FindOrCreateChannelService;

  public async handleInfoSync(message: Message, raw: StandardMessage) {
    //TODO figure out a better indicator of request to sync vs. send to sync requester
    if (raw.message.body) {
      let updatedChannel = await this.findOrCreator.createChannel(raw.channelInfo);
      if (await this.channelVerifier.isValidChain(updatedChannel.contextChain)) {
        // TODO resolve saving the updated channel context
      }
    } else {
      //TODO send info channel sync message back with channel context
    }
    return message;
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/info-sync-handler': ReceivedChannelInfoSyncHandler;
  }
}
