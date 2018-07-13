import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import showdown from 'showdown';
import { sanitize } from 'dom-purify';

import Message from 'emberclear/data/models/message';

// https://www.regextester.com/98192
const URL_PATTERN = /(((http|https)\:\/\/)|(www)){1}[a-zA-Z0-9\.\/\?\:@\-_=#]+\.([a-zA-Z0-9\&\.\/\?\:@\-_=#])*/gi

const converter = new showdown.Converter({
  simplifiedAutoLink: true,
  simpleLineBreaks: true,
  openLinksInNewWindow: true,
});

export default class extends Component {
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
}
