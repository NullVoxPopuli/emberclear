import StoreService from '@ember-data/store';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import ChannelManager from 'emberclear/services/channel-manager';

type Args = {
  onSubmit: () => void;
};

export default class ChannelForm extends Component<Args> {
  @service store!: StoreService;
  @service channelManager!: ChannelManager;

  @tracked newChannelName = '';

  @action
  onFormSubmit(this: ChannelForm) {
    return this.didSubmitChannelName();
  }

  @action
  onInput({ target = {} as HTMLInputElement }) {
    this.newChannelName = target.value;
  }

  @action
  onKeyPress(this: ChannelForm, event: KeyboardEvent) {
    const { keyCode } = event;

    if (keyCode === 13) {
      this.didSubmitChannelName();

      return false;
    }

    return true;
  }

  private async didSubmitChannelName() {
    await this.createChannel();

    this.newChannelName = '';

    return this.args.onSubmit();
  }

  private async createChannel() {
    const id = this.newChannelName;

    // TODO: using both will likely lead to problems in the future.
    //       id should maybe be a guid which will allow the channel
    //       name to change
    return await this.channelManager.findOrCreate(id, id);
  }
}
