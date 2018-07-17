import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';
import showdown from 'showdown';
import { sanitize } from 'dom-purify';

import PrismManager from 'emberclear/services/prism-manager';
import Message from 'emberclear/data/models/message';
import { matchAll } from 'emberclear/src/utils/string/utils';

// https://www.regextester.com/98192
const URL_PATTERN = /(((http|https)\:\/\/)|(www)){1}[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\&\.\/\?\:@\-_=#])*/gi

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

  @computed('messageBody')
  get urls() {
    const urls = this.message.body!.match(URL_PATTERN);
    if (urls === null) return [];

    return urls.map(u => u.replace('gifv', 'mp4'));
  }

  didInsertElement() {
    // non-blocking
    this._addLanguages(this.message.body);
  }

  async _addLanguages(text: string) {
    const languages = this._parseLanguages(text);

    languages.forEach(language => {
      this.prismManager.addLanguage.perform(language)
    });
  }

  _parseLanguages(text: string): string[] {
    let languages: string[] = [];

    const matches = matchAll(text, /```(\w+)/g);


    matches.forEach(match => languages.push(match[1]));

    return languages;
  }
}
