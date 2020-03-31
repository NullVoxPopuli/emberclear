import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import Channel from 'emberclear/models/channel';
import Notifications from 'emberclear/services/notifications';

export default class ReceivedChannelMessageHandler extends Service {
  @service store!: StoreService;
  @service intl!: Intl;
  @service notifications!: Notifications;

  public async handleChannelMessage(message: Message, _raw: RelayJson) {
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
      // save message in channel messages
      await message.save();
      const senderName = message.sender!.name;
      const channelName = existingChannel.name;
      // TODO: make new notification for channels messages
      const msg = this.intl.t('ui.notificatoin.from', { senderName });

      this.notifications.info(msg);
    }
    return message;
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/message-handler': ReceivedChannelMessageHandler;
  }
}
