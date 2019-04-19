import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';

import { action, computed } from '@ember/object';

import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import MessageFactory from 'emberclear/services/messages/factory';
import Identity from 'emberclear/src/data/models/identity/model';
import Channel from 'emberclear/src/data/models/channel';

interface IArgs {
  to: Identity | Channel;
}

export default class ChatEntry extends Component<IArgs> {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;
  @service('messages/factory') messageFactory!: MessageFactory;
  @service store;

  @tracked text?: string;
  @tracked isDisabled = false;

  @reads('to.name') messageTarget!: string;

  get placeholder() {
    let prefix = '';

    if (this.args.to instanceof Channel) {
      prefix = 'everyone in ';
    }

    return `Send a message to ${prefix}${this.messageTarget}`;
  }

  get isSubmitDisabled() {
    return !this.text || this.text.length === 0 || this.isDisabled;
  }

  @action async sendMessage(this: ChatEntry) {
    if (!this.text) return;

    this.isDisabled = true;

    await this.dispatchMessage(this.text);

    // removing this later causes the input field to not actually get
    // cleared
    later(() => {
      this.isDisabled = false;
      this.text = '';
    });
  }

  @action onKeyPress(this: ChatEntry, event: KeyboardEvent) {
    const { keyCode, shiftKey } = event;

    // don't submit when shift is being held.
    if (!shiftKey && keyCode === 13) {
      this.sendMessage();

      // prevent regular 'Enter' from inserting a linebreak
      return false;
    }

    return false;
  }

  async dispatchMessage(text: string) {
    await this.messageDispatcher.send(text, this.args.to);
  }
}
