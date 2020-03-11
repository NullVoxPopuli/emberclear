import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { waitForPromise } from 'ember-test-waiters';

import { action, set } from '@ember/object';

import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import MessageFactory from 'emberclear/services/messages/factory';
import Channel from 'emberclear/models/channel';
import Contact from 'emberclear/models/contact';
import { unicode } from 'emojis';

const EMOJI_REGEX = /:[^:]+:/g;

interface IArgs {
  to: Contact | Channel;
}

export default class ChatEntry extends Component<IArgs> {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;
  @service('messages/factory') messageFactory!: MessageFactory;
  @service store!: StoreService;

  @tracked isDisabled = false;

  text?: string;

  get placeholder() {
    const { to } = this.args;
    let prefix = '';

    if (to instanceof Channel) {
      prefix = 'everyone in ';
    }

    return `Send a message to ${prefix}${to.name}`;
  }

  @action async sendMessage() {
    if (!this.text) return;

    this.isDisabled = true;

    await this.dispatchMessage(this.text);

    this.isDisabled = false;
    this.updateText('');
  }

  @action updateText(text: string) {
    set(this, 'text', text);
  }

  @action onInput(event: KeyboardEvent) {
    const value = (event.target as any).value;

    // TODO: only test the regex since the last detected `:`
    // (for perf)
    if (EMOJI_REGEX.test(value)) {
      this.updateText(unicode(value));
    } else {
      this.updateText(value);
    }
  }

  @action onKeyPress(event: KeyboardEvent) {
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
    await waitForPromise(this.messageDispatcher.send(text, this.args.to));
  }
}
