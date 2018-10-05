import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';

import DS from 'ember-data';
import ChannelManager from 'emberclear/services/channel-manager';

export default class ChannelForm extends Component {
  onSubmit!: () => void;

  @service store!: DS.Store;
  @service channelManager!: ChannelManager;

  newChannelName = '';

  @action
  onFormSubmit(this: ChannelForm) {
    this.createChannel();

    this.set('newChannelName', '');

    this.onSubmit();
  }

  private async createChannel() {
    const id = this.newChannelName;

    // TODO: using both will likely lead to problems in the future.
    //       id should maybe be a guid which will allow the channel
    //       name to change
    return await this.channelManager.findOrCreate(id, id);
  }
}
