import { inject as service } from '@ember/service';

import Modifier from 'ember-modifier';

import type CurrentChatService from '../services/current-chat';

export default class UpdateDocumentTitle extends Modifier {
  @service declare currentChat: CurrentChatService;
  @service declare intl: Intl;

  originalDocumentTitle: string;
  appName: string;

  constructor(owner: any, args: any) {
    super(owner, args);
    this.originalDocumentTitle = document.title;
    this.appName = this.intl.t('appname');
  }

  get tokens() {
    return this.args.positional.filter((token) => token);
  }

  willDestroy() {
    document.title = this.originalDocumentTitle;
  }

  didReceiveArguments() {
    let tokens = this.tokens;

    let currentChat = this.currentChat.name;

    if (currentChat) {
      tokens.push(currentChat);
    }

    tokens.push(this.appName);

    document.title = tokens.join(' | ');
  }
}
