import Component from '@ember/component';

import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';

export default class MessageEntry extends Component {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;

  // value from the input field
  text?: string;
  // disable the text field while sending
  isDisabled = false;

  @computed('to.name')
  get messageTarget() {
    if (this.to) {
      return this.to.name;
    }

    // TODO: i18n
    // TODO: support more channels
    return 'The Public Channel';
  }

  @action
  async send(this: MessageEntry) {
    this.set('isDisabled', true);

    if (!this.text) return;

    await this.messageDispatcher.sendMessage(this.text);

    this.set('isDisabled', false);
    this.set('text', '');
  }

  @action
  onInputChange(this: MessageEntry, event: KeyboardEvent) {
    const text = (event.target as HTMLInputElement).value;

    this.set('text', text);
  }
}
