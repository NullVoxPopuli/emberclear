import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';

import { languages as allLanguages } from 'emberclear/src/services/prism-manager';
import Contact from 'emberclear/src/data/models/contact/model';

const codeDelimiter = '```';

export default class SnippetModal extends Component {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;

  languages = allLanguages;

  sendTo!: Contact;
  close!: () => void;

  text = '';
  title = '';
  language = '';

  @action
  sendMessage() {
    const messageParts = [
      `*${this.title}*`,
      '\n',
      `${codeDelimiter}${this.language}`,
      this.text,
      codeDelimiter,
    ];

    const message = messageParts.join('\n');

    this.messageDispatcher.send(message, this.sendTo);
    this.close();
  }
}
