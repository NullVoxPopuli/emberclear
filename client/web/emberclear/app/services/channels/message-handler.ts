import Service, { inject as service } from '@ember/service';
import Message from 'emberclear/models/message';
import StoreService from '@ember-data/store';
import Notifications from 'emberclear/services/notifications';
import ChannelVerifier from './channel-verifier';
import FindOrCreateChannelService from './find-or-create';
import { saveChannel } from './-utils/channel-saver';
import { identitiesIncludes } from 'emberclear/utils/identity-comparison';

export default class ReceivedChannelMessageHandler extends Service {
  @service store!: StoreService;
  @service intl!: Intl;
  @service notifications!: Notifications;
  @service('channels/channel-verifier') channelVerifier!: ChannelVerifier;
  @service('channels/find-or-create') findOrCreator!: FindOrCreateChannelService;

  public async handleChannelMessage(message: Message, raw: StandardMessage) {
    let existingChannel = await this.findOrCreator.findOrCreateChannel(raw.channelInfo);

    await saveChannel(existingChannel);

    if (identitiesIncludes(existingChannel?.contextChain.members.toArray(), message.sender!)) {
      // save message in channel messages
      await message.save();
      const senderName = message.sender!.name;
      const channelName = existingChannel.name;
      const msg = this.intl.t('ui.notifications.fromChannel', {
        name: senderName,
        channel: channelName,
      });

      await this.notifications.info(msg);

      // TODO: check to look for tampered or mismatched context and handle accordingly
      if (!this.channelVerifier.isValidChain(existingChannel.contextChain)) {
        // TODO: Do something to show/notify that the channel context is incorrect
        // TODO: The receiver notifies the sender with similar things
      }
    } else {
      await message.unloadRecord();
    }

    return message;
  }
}

declare module '@ember/service' {
  interface Registry {
    'channels/message-handler': ReceivedChannelMessageHandler;
  }
}
