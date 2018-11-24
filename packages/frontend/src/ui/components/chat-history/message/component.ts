import Component from 'sparkles-component';
import { computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import PromiseMonitor from 'ember-computed-promise-monitor';

import PrismManager from 'emberclear/services/prism-manager';
import ChatScroller from 'emberclear/services/chat-scroller';
import Message from 'emberclear/data/models/message/model';
import Identity from 'emberclear/data/models/identity/model';

import { markAsRead } from 'emberclear/src/data/models/message/utils';
import { parseLanguages, parseURLs } from 'emberclear/src/utils/string/utils';
import { convertAndSanitizeMarkdown } from 'emberclear/src/utils/dom/utils';
import { monitor } from 'emberclear/src/utils/decorators';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';

interface IArgs {
  message: Message;
}

export default class extends Component<IArgs> {
  @service prismManager!: PrismManager;
  @service chatScroller!: ChatScroller;
  io?: IntersectionObserver;
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

    this.maybeSetupReadWatcher();
  }

  willDestroyElement() {
    this.io && this.io.disconnect();
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

  private maybeSetupReadWatcher() {
    const { message } = this.args;

    if (message.readAt) return;

    this.setupIntersectionObserver();
  }


  private setupIntersectionObserver() {
    const { message } = this.args;

    const io = new IntersectionObserver(entries => {
      const isVisible = (entries[0].intersectionRatio !== 0);

      const canBeSeen = !message.isSaving && document.hasFocus();
      if (isVisible && canBeSeen) {
        this.markRead.perform();

        io.unobserve(this.element);
        this.io = undefined;
      }
    }, {
      root: document.querySelector('.messages'),
    });

    io.observe(this.element);

    this.io = io;
  }

  @task * markRead() {
    const { message } = this.args;

    while(true) {
      if (message.isSaving || !document.hasFocus()) {
        yield timeout(5);
      } else {
        yield markAsRead(this.args.message);
        return;
      }
    }
  }
}
