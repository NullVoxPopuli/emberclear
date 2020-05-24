import Component from '@glimmer/component';
import Message from 'emberclear/models/message';

interface IArgs {
  message: Message;
}

export default class MessageHeader extends Component<IArgs> {
  get sender() {
    return this.args.message.sender;
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
}
