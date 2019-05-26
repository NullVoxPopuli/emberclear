import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { once, later } from '@ember/runloop';

import { action } from '@ember/object';

import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import StoreService from 'ember-data/store';
import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import MessageFactory from 'emberclear/services/messages/factory';
import Channel from 'emberclear/src/data/models/channel';
import Contact from 'emberclear/src/data/models/contact/model';

interface IArgs {
  to: Contact | Channel;
}

export default class ChatEntry extends Component<IArgs> {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;
  @service('messages/factory') messageFactory!: MessageFactory;
  @service store!: StoreService;

  @tracked text?: string;
  @tracked isDisabled = false;

  textarea!: HTMLTextAreaElement;

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

  @action onInsertTextArea(element: HTMLTextAreaElement) {
    this.textarea = element;
  }

  @action async sendMessage() {
    if (!this.text) return;

    this.isDisabled = true;

    await this.dispatchMessage(this.text);

    // removing this later causes the input field to not actually get
    // cleared
    once(this, () => {
      this.isDisabled = false;
      this.text = '';

      // this feels hacky :-\
      later(() => {
        this.textarea.focus();
      }, 1);
    });
  }

  @action onInput(event: KeyboardEvent) {
    const value = (event.target as any).value;

    this.text = value;
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
    await this.messageDispatcher.send(text, this.args.to);
  }
}
