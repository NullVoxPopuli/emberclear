import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import MessageDispatcher from 'emberclear/services/messages/dispatcher';

import { languages as allLanguages } from 'emberclear/services/prism-manager';
import Contact from 'emberclear/models/contact';
import Channel from 'emberclear/models/channel';

const codeDelimiter = '```';

interface Args {
  isActive: boolean;
  close: () => void;
  sendTo: Contact | Channel;
}

export default class SnippetModal extends Component<Args> {
  @service('messages/dispatcher') messageDispatcher!: MessageDispatcher;

  languages = allLanguages;

  @tracked text = '';
  @tracked title = '';
  @tracked language = '';

  @action
  sendMessage() {
    let { sendTo, close } = this.args;

    const messageParts = [
      `*${this.title}*`,
      '\n',
      `${codeDelimiter}${this.language}`,
      this.text,
      codeDelimiter,
    ];

    const message = messageParts.join('\n');

    this.messageDispatcher.send(message, sendTo);
    close();
  }
}
