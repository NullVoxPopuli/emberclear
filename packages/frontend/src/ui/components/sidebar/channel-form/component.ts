import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';

import DS from 'ember-data';

export default class ChannelForm extends Component {
  onSubmit!: () => void;

  @service store!: DS.Store;

  newChannelName = '';

  @action
  onFormSubmit(this: ChannelForm) {
    this.createChannel();

    this.set('newChannelName', '');

    this.onSubmit();

  }


  private async createChannel() {
    const record = this.store.createRecord('channel', {
      id: this.newChannelName,
      name: this.newChannelName
    });

    await record.save();
  }
}
