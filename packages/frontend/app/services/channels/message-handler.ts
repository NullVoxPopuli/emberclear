import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import Notifications from 'emberclear/services/notifications';
import ChannelVerifier from './channel-verifier';
import FindOrCreateChannelService from './find-or-create';

export default class ReceivedChannelMessageHandler extends Service {
  @service store!: StoreService;
  @service intl!: Intl;
  @service notifications!: Notifications;
  @service('channels/channel-verifier') channelVerifier!: ChannelVerifier;
  @service('channels/find-or-create') findOrCreator!: FindOrCreateChannelService;

  public async handleChannelMessage(message: Message, raw: StandardMessage) {
    let existingChannel = await this.findOrCreator.findOrCreateChannel(raw.channelInfo);
    existingChannel.save();
    if (existingChannel?.members.contains(message.sender!)) {
      // save message in channel messages
      await message.save();
      const senderName = message.sender!.name;
      const channelName = existingChannel.name;
      // TODO: make new notification for channels messages
      const msg = this.intl.t('ui.notificatoin.from', { senderName });

      this.notifications.info(msg);

      // TODO: check to look for tampered or mismatched context and handle accordingly
      if (!this.channelVerifier.isValidChain(existingChannel.contextChain)) {
        // TODO: Do something to show/notify that the channel context is incorrect
        // TODO: The receiver notifies the sender with similar things
      }
    }
    return message;
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/message-handler': ReceivedChannelMessageHandler;
  }
}
