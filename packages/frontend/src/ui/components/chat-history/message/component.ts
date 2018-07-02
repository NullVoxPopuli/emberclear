import Component from '@ember/component';
import { computed } from '@ember-decorators/object';
import Message from 'emberclear/data/models/message';

const URL_PATTERN = /[-a-zA-Z0-9@:%_+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?/gi;

export default class extends Component {
  message!: Message;

  @computed('message.body')
  get urls() {
    const urls = this.message.body!.match(URL_PATTERN);
    if (urls === null) return [];

    return urls.map(u => u.replace('gifv', 'mp4'));
  }
}
