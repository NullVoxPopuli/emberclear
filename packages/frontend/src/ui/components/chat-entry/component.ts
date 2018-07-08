import Component from '@ember/component';

import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import Identity from 'emberclear/data/models/identity/model';

export default class MessageEntry extends Component {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;
  @service prismManager!: PrismManager;

  to?: Identity;
  // value from the input field
  text?: string;
  // disable the text field while sending
  isDisabled = false;

  didRender() {
    this.element.querySelector('textarea').onkeypress = this.onKeyPress.bind(this);
  }

  @computed('to.name')
  get messageTarget() {
    if (this.to) {
      return this.to.name;
    }

    // TODO: i18n
    // TODO: support more channels
    return 'The Public Channel';
  }

  @computed('messageTarget')
  get placeholder() {
    return `Send a message to ${this.messageTarget}`;
  }

  @action
  async sendMessage(this: MessageEntry) {
    this.set('isDisabled', true);

    if (!this.text) return;

    await this.messageDispatcher.sendMessage(this.text);

    this.set('isDisabled', false);
    this.set('text', '');
    this.element.querySelector('textarea').value = '';
    this.prismManager.addLanguage('typescript');
  }

  @action
  onKeyPress(this: MessageEntry, event: KeyboardEvent) {
    const { keyCode, shiftKey} = event;

    // don't submit when shift is being held.
    if (!shiftKey && keyCode === 13) {
      this.send('sendMessage');
    }
  }
}
