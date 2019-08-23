import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { timeout, task } from 'ember-concurrency';

import ChatScroller from 'emberclear/services/chat-scroller';
import Message from 'emberclear/models/message';
import { markAsRead } from 'emberclear/models/message/utils';
import Identity from 'emberclear/models/identity';
import SettingsService from 'emberclear/services/settings';
import CurrentUserService from 'emberclear/services/current-user';

import { parseURLs } from 'emberclear/utils/string/utils';
import { convertAndSanitizeMarkdown } from 'emberclear/utils/dom/utils';
import Task from 'ember-concurrency/task';

interface IArgs {
  message: Message;
}

export default class MessageDisplay extends Component<IArgs> {
  @service chatScroller!: ChatScroller;
  @service settings!: SettingsService;
  @service currentUser!: CurrentUserService;

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
    if (this.sender) {
      return this.sender.name;
    }

    return '';
  }

  get urls() {
    const content = this.args.message.body!;

    return parseURLs(content);
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
  markRead!: Task;
}
