import Component from '@ember/component';
import { later } from '@ember/runloop';

import { action, computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import MessageFactory from 'emberclear/services/messages/factory';
import Identity from 'emberclear/src/data/models/identity/model';
import Channel from 'emberclear/src/data/models/channel';


export default class ChatEntry extends Component {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;
  @service('messages/factory') messageFactory!: MessageFactory;

  to!: Identity | Channel;
  // value from the input field
  text?: string;
  // disable the text field while sending
  isDisabled = false;

  didRender() {
    const mainInput = this.element.querySelector('textarea.chat-entry') as HTMLElement;

    mainInput.onkeypress = this.onKeyPress.bind(this);
    mainInput.onkeyup = this.onKeyUp.bind(this);
    mainInput.onkeydown = this.onKeyUp.bind(this);
  }

  @reads('to.name') messageTarget!: string;

  @computed('messageTarget')
  get placeholder() {
    let prefix = '';

    if (this.to instanceof Channel) {
      prefix = 'everyone in ';
    }

    return `Send a message to ${prefix}${this.messageTarget}`;
  }

  @computed('text', 'isDisabled')
  get isSubmitDisabled() {
    return  !this.text || this.text.length === 0 || this.isDisabled;
  }

  @action
  async sendMessage(this: ChatEntry) {
    if (!this.text) return;

    this.set('isDisabled', true);

    await this.dispatchMessage(this.text);

    this.set('isDisabled', false);
    this.set('text', '');

    later(this, () => {
      this.adjustHeightOfTextInput();
    });
  }

  @action
  onKeyPress(this: ChatEntry, event: KeyboardEvent) {
    const { keyCode, shiftKey } = event;

    this.adjustHeightOfTextInput();
    // don't submit when shift is being held.
    if (!shiftKey && keyCode === 13) {
      this.send('sendMessage');

      // prevent regular 'Enter' from inserting a linebreak
      return false;
    }

    return true;
  }

  @action
  onKeyUp(_event: KeyboardEvent) {
    this.adjustHeightOfTextInput();
  }

  adjustHeightOfTextInput() {
    const textarea = this.element.querySelector('textarea') as HTMLTextAreaElement;
    const sizer = this.element.querySelector('.textarea-size')!;

    sizer.innerHTML = textarea.value + '\n';
  }

  async dispatchMessage(text: string) {
    this.messageDispatcher.send(text, this.to);
  }
}
