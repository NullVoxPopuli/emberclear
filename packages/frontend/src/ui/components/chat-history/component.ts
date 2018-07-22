import Component from '@ember/component';
import { later } from '@ember/runloop';

// TODO:
//  - show a "hey there are more messages" notice when there are
//    new messages
//  - when scrolling up, new messages coming in shouldn't
//    scroll back to the bottom
//  - when already at the bottom, receiving new messages
//    should scroll the view to the bottom
export default class ChatHistory extends Component {
  didRender(this: ChatHistory) {
    later(this, () => this.scrollMessagesContainer());
  }

  scrollMessagesContainer() {
    const element = this.element.querySelector('.messages') as HTMLElement;
    const messages = element.querySelectorAll('.message');
    const lastMessage = messages[messages.length - 1] as HTMLElement;
    // const lastMessage = element.querySelector('.message:last-child');

    if (lastMessage) {
      element.scrollTop = lastMessage.offsetTop + lastMessage.offsetHeight;
    }
  }
}
