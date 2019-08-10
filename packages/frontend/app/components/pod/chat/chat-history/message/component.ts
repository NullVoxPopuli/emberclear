import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { timeout, task } from 'ember-concurrency';

import ChatScroller from 'emberclear/services/chat-scroller';
import Message from 'emberclear/data/models/message/model';
import { markAsRead } from 'emberclear/src/data/models/message/utils';
import Identity from 'emberclear/data/models/identity/model';
import SettingsService from 'emberclear/src/services/settings';
import CurrentUserService from 'emberclear/services/current-user/service';

import { parseURLs } from 'emberclear/src/utils/string/utils';
import { convertAndSanitizeMarkdown } from 'emberclear/src/utils/dom/utils';
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

  @computed('settings.useLeftRightJustificationForMessages', 'hasSender')
  get alignment() {
    if (!this.settings.useLeftRightJustificationForMessages) return '';

    if (this.hasSender && this.sender!.id !== this.currentUser.id) {
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
  markRead!: Task;
}
