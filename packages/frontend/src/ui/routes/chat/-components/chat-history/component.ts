import Component from '@ember/component';

export default class ChatHistory extends Component {
  didRender() {
    this.scrollMessagesContainer();
  }

  scrollMessagesContainer() {
    const element = this.element.querySelector('.messages') as HTMLElement;
    const lastMessage = element.querySelector('.message:last-child') as HTMLElement;

    if (lastMessage) {
      element.scrollTop = lastMessage.offsetTop + lastMessage.offsetHeight;
    }
  }
}
