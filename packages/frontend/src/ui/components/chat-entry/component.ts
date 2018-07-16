import Component from '@ember/component';

import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import Identity from 'emberclear/data/models/identity/model';
import PrismManager from 'emberclear/services/prism-manager';

import { matchAll } from 'emberclear/src/utils/string/utils';

export default class MessageEntry extends Component {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;
  @service prismManager!: PrismManager;

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

    // non-blocking
    this._addLanguages(this.text);

    this.set('isDisabled', false);
    this.set('text', '');

    const textarea = this.element.querySelector('textarea')!;

    textarea.value = '';
    textarea.style.cssText = '';

  }

  @action
  onKeyPress(this: MessageEntry, event: KeyboardEvent) {
    const { keyCode, shiftKey, target } = event;

    this._adjustHeight(target);

    // don't submit when shift is being held.
    if (!shiftKey && keyCode === 13) {
      this.send('sendMessage');

      // prevent regular 'Enter' from inserting a linebreak
      return false;
    }
  }

  _adjustHeight(element: HTMLElement) {
    element.style.cssText = `
      max-height: 7rem;
      height: ${element.scrollHeight}px
    `;
  }

  async _addLanguages(text: string) {
    const languages = this._parseLanguages(text);

    languages.forEach(language => {
      this.prismManager.addLanguage.perform(language)
    });
  }

  _parseLanguages(text: string): string[] {
    let languages: string[] = [];

    const matches = matchAll(text, /```(\w+)/g);


    matches.forEach(match => languages.push(match[1]));

    return languages;
  }
}
