import Component from '@glimmer/component';
import { computed, action } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import PromiseMonitor from 'ember-computed-promise-monitor';
import { timeout, task } from 'ember-concurrency';

import ChatScroller from 'emberclear/services/chat-scroller';
import Message from 'emberclear/data/models/message/model';
import { markAsRead } from 'emberclear/src/data/models/message/utils';
import Identity from 'emberclear/data/models/identity/model';
import SettingsService from 'emberclear/src/services/settings';
import IdentityService from 'emberclear/src/services/identity/service';

import { parseURLs } from 'emberclear/src/utils/string/utils';
import { convertAndSanitizeMarkdown } from 'emberclear/src/utils/dom/utils';
import { monitor } from 'emberclear/src/utils/decorators';

interface IArgs {
  message: Message;
}

export default class MessageDisplay extends Component<IArgs> {
  @service chatScroller!: ChatScroller;
  @service settings!: SettingsService;
  @service identity!: IdentityService;

  get messageBody() {
    const markdown = this.args.message.body;

    return convertAndSanitizeMarkdown(markdown);
  }

  get sender(): Identity | undefined {
    return this.args.message.sender as any;
  }

  get hasSender() {
    return this.sender;
  }

  get senderName() {
    if (this.hasSender) {
      return this.sender.name;
    }

    return '';
  }

  get urls() {
    const content = this.args.message.body!;

    return parseURLs(content);
  }

  @computed('settings.useLeftRightJustificationForMessages', 'hasSender')
  get alignment() {
    if (!this.settings.useLeftRightJustificationForMessages) return '';

    if (this.hasSender && this.sender!.result!.id !== this.identity.id) {
      return 'justify-received';
    }

    return 'justify-sent';
  }

  @task(function*(this: MessageDisplay) {
    const { message } = this.args;

    let attempts = 0;
    while (attempts < 100) {
      attempts++;
      if (message.isSaving || !document.hasFocus()) {
        yield timeout(5);
      } else {
        yield markAsRead(this.args.message);
        return;
      }
    }
  })
  markRead;
}
