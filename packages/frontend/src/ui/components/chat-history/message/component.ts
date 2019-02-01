import Component from 'sparkles-component';
import { computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { inject as service } from '@ember-decorators/service';
import PromiseMonitor from 'ember-computed-promise-monitor';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';

import PrismManager from 'emberclear/services/prism-manager';
import ChatScroller from 'emberclear/services/chat-scroller';
import Message from 'emberclear/data/models/message/model';
import { markAsRead } from 'emberclear/src/data/models/message/utils';
import Identity from 'emberclear/data/models/identity/model';
import SettingsService from 'emberclear/src/services/settings';
import IdentityService from 'emberclear/src/services/identity/service';

import { parseLanguages, parseURLs } from 'emberclear/src/utils/string/utils';
import { convertAndSanitizeMarkdown } from 'emberclear/src/utils/dom/utils';
import { monitor } from 'emberclear/src/utils/decorators';

interface IArgs {
  message: Message;
}

export default class extends Component<IArgs> {
  @service prismManager!: PrismManager;
  @service chatScroller!: ChatScroller;
  @service settings!: SettingsService;
  @service identity!: IdentityService;

  element!: HTMLElement;

  @computed('message.body')
  get messageBody() {
    const markdown = this.args.message.body;

    return convertAndSanitizeMarkdown(markdown);
  }

  @computed('message.sender')
  @monitor
  get sender(): PromiseMonitor<Identity | undefined> {
    return this.args.message.sender as any;
  }

  @reads('sender.isFulfilled') hasSender!: boolean;

  @computed('sender.result', 'hasSender')
  get senderName() {
    if (this.hasSender) {
      return this.sender.result!.name;
    }

    return '';
  }

  @computed('messageBody')
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

  didInsertElement() {
    this.element = document.getElementById(this.args.message.id)!;

    // extra code features
    this.makeCodeBlocksFancy();

    // non-blocking
    this.addLanguages(this.args.message.body);

    // maybe scroll to the bottom?
    // should this really live here?
    // every inserted message is going to call this....
    this.chatScroller.maybeNudgeToBottom(this.element);
  }

  private async addLanguages(text: string) {
    const languages = parseLanguages(text);

    languages.forEach(language => {
      this.prismManager.addLanguage.perform(language, this.element);
    });
  }

  private makeCodeBlocksFancy() {
    const pres = this.element.querySelectorAll('pre');

    if (pres && pres.length > 0) {
      pres.forEach(p => p.classList.add('line-numbers'));
    }
  }

  @task
  *markRead() {
    const { message } = this.args;

    while (true) {
      if (message.isSaving || !document.hasFocus()) {
        yield timeout(5);
      } else {
        yield markAsRead(this.args.message);
        return;
      }
    }
  }
}
