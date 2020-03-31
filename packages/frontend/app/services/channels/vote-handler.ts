import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import Channel from 'emberclear/models/channel';

export default class ReceivedChannelVoteHandler extends Service {
  @service store!: StoreService;

  public async handleChannelVote(message: Message, _raw: RelayJson) {
    // check if channel exists
    let channelMetadata: Channel = message.metadata;
    let existingChannel = undefined;
    try {
      existingChannel = await this.store.findRecord('channel', channelMetadata.id);
    } catch (e) {
      // TODO: handle if user not in channel
    }
    // check if sender is in channel
    if (existingChannel?.members.contains(message.sender!)) {
      // check vote havn't been tampered with
      let channelVote = existingChannel.activeVotes.find(activeVote => activeVote.id === message.body);
      let sentVote = channelMetadata.activeVotes.find(activeVote => activeVote.id === message.body);
      if(sentVote !== undefined) {
        
        // add vote to channel context

      }
    }
    return message;
  }
}