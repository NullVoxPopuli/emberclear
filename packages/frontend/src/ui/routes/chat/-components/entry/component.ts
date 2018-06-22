import Component from '@ember/component';

import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';

export default class MessageEntry extends Component {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;

  // value from the input field
  text?: string;
  // disable the text field while sending
  isDisabled = false;

  @action
  async send(this: MessageEntry) {
    this.set('isDisabled', true);

    if (!this.text) return;

    await this.messageDispatcher.sendMessage(this.text);

    this.set('isDisabled', false);
    this.set('text', '');
  }
}
