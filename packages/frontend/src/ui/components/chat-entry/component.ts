import Component from '@ember/component';
import { later } from '@ember/runloop';

import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import MessageFactory from 'emberclear/services/messages/factory';
import Identity from 'emberclear/data/models/identity/model';


export default class ChatEntry extends Component {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;
  @service('messages/factory') messageFactory!: MessageFactory;

  to?: Identity;
  // value from the input field
  text?: string;
  // disable the text field while sending
  isDisabled = false;

  didRender() {
    this.element.querySelector('textarea')!.onkeypress = this.onKeyPress.bind(this);
  }

  @computed('to.name')
  get messageTarget() {
    if (this.to) {
      return this.to.name;
    }

    // TODO: i18n
    // TODO: support more channels
    return 'Everyone in your contacts';
  }

  @computed('messageTarget')
  get placeholder() {
    return `Send a message to ${this.messageTarget}`;
  }

  @action
  async sendMessage(this: ChatEntry) {
    if (!this.text) return;

    this.set('isDisabled', true);

    await this.dispatchMessage(this.text);
    later(this, () => this.scollContainer());

    this.set('isDisabled', false);
    this.set('text', '');
  }

  @action
  onKeyPress(this: ChatEntry, event: KeyboardEvent) {
    const { keyCode, shiftKey, target } = event;

    this.adjustHeight(target as HTMLElement);

    // don't submit when shift is being held.
    if (!shiftKey && keyCode === 13) {
      this.send('sendMessage');

      // prevent regular 'Enter' from inserting a linebreak
      return false;
    }

    return true;
  }

  private adjustHeight(element: HTMLElement) {
    element.style.cssText = `
      max-height: 7rem;
      height: ${element.scrollHeight}px
    `;
  }

  private scollContainer() {
    const container = this.element.parentElement!;
    const element = container.querySelector('.messages')!;
    const messages = element.querySelectorAll('.message')!;
    const lastMessage = messages[messages.length - 1] as HTMLElement;

    if (lastMessage) {
      element.scrollTop = lastMessage.offsetTop + lastMessage.offsetHeight;
    }
  }

  private async dispatchMessage(text: string) {
    if (this.to) {
      const msg = this.messageFactory.buildWhisper(text, this.to);

      await msg.save();

      if (this.to.id === 'me') return;

      return await this.messageDispatcher.sendToUser(msg, this.to);
    }

    const msg = this.messageFactory.buildChat(text);

    await msg.save();

    return await this.messageDispatcher.sendToAll(msg);
  }
}
