import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { reads } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';
import showdown from 'showdown';
import { sanitize } from 'dom-purify';
import { PromiseMonitor } from 'ember-computed-promise-monitor';


import PrismManager from 'emberclear/services/prism-manager';
import Message from 'emberclear/data/models/message';
import Identity from 'emberclear/data/models/identity/model';
import { parseLanguages, parseURLs } from 'emberclear/src/utils/string/utils';

const converter = new showdown.Converter({
  simplifiedAutoLink: true,
  simpleLineBreaks: true,
  openLinksInNewWindow: true,
});

export default class extends Component {
  @service prismManager!: PrismManager;
  message!: Message;

  @computed('message.body')
  get messageBody() {
    const markdown = this.message.body;
    const html = converter.makeHtml(markdown);
    const sanitized = sanitize(html);

    return sanitized;
  }

  @computed('message.sender')
  get sender(): PromiseMonitor<Identity> {
    const promise = this.message.sender;

    return new PromiseMonitor<Identity>(promise);
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
