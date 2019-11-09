import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import Message from 'emberclear/models/message';
import Identity from 'emberclear/models/identity';
import SettingsService from 'emberclear/services/settings';
import CurrentUserService from 'emberclear/services/current-user';

import { parseURLs } from 'emberclear/utils/string/utils';
import { convertAndSanitizeMarkdown } from 'emberclear/utils/dom/utils';

interface IArgs {
  message: Message;
}

export default class MessageDisplay extends Component<IArgs> {
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
}
