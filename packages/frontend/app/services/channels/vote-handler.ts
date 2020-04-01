import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';

export default class ReceivedChannelVoteHandler extends Service {
  @service store!: StoreService;

  public async handleChannelVote(message: Message, raw: RelayJson) {
    // check if channel exists
    let existingChannel = undefined;
    try {
      existingChannel = await this.store.findRecord('channel', raw.channelInfo!.uid);
    } catch (e) {
      // TODO: handle if user not in channel
    }
    // check if sender is in channel
    if (existingChannel?.members.contains(message.sender!)) {
      let sentVote: Vote = message.metadata;    
      
      if(sentVote !== undefined) {
        let channelVote = existingChannel.activeVotes.find(activeVote => activeVote.id === sentVote.id);

        // TODO check vote havn't been tampered with
        
        // add vote to channel context

      }
    }
    return message;
  }
}