import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import { convertAndSanitizeMarkdown } from 'emberclear/utils/dom/utils';
import { parseURLs } from 'emberclear/utils/string/utils';

import type Message from 'emberclear/models/message';
import type { CurrentUserService } from '@emberclear/local-account';

interface IArgs {
  message: Message;
}

export default class MessageDisplay extends Component<IArgs> {
  @service currentUser!: CurrentUserService;

  get messageBody() {
    const markdown = this.args.message.body;

    return convertAndSanitizeMarkdown(markdown);
  }

  get direction() {
    if (this.args.message.sender === this.currentUser.record) {
      return 'outgoing';
    }

    return 'incoming';
  }

  get urls() {
    const content = this.args.message.body!;

    return parseURLs(content);
  }
}
