import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import PromiseMonitor from 'ember-computed-promise-monitor';

import PrismManager from 'emberclear/services/prism-manager';
import ChatScroller from 'emberclear/services/chat-scroller';
import Message from 'emberclear/data/models/message';
import Identity from 'emberclear/data/models/identity/model';
import { parseLanguages, parseURLs } from 'emberclear/src/utils/string/utils';
import { convertAndSanitizeMarkdown } from 'emberclear/src/utils/dom/utils';
import { monitor } from 'emberclear/src/utils/decorators';

export default class extends Component {
  @service prismManager!: PrismManager;
  @service chatScroller!: ChatScroller;
  message!: Message;

  @computed('message.body')
  get messageBody() {
    const markdown = this.message.body;

    return convertAndSanitizeMarkdown(markdown);
  }

  @computed('message.sender')
  @monitor
  get sender(): PromiseMonitor<Identity | undefined> {
    return this.message.sender as any;
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
    const content = this.message.body!;

    return parseURLs(content);
  }

  didInsertElement() {
    // extra code features
    this.makeCodeBlocksFancy();

    // non-blocking
    this.addLanguages(this.message.body);


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
}
