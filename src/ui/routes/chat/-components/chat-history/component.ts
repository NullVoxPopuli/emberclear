import DS from 'ember-data';
import Component from '@ember/component';

import { action, computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';


export default class ChatHistory extends Component {
  @service store!: DS.Store;

  didInsertElement() {
    let msg = this.store.createRecord('message',{
      from: 'Me',
      body: 'hi',
      sentAt: new Date(),
      receivedAt: new Date()
    });

    this.set('messages', [msg, msg, msg]);
  }

  didRender() {
    // this..didRender();

    this.scrollMessagesContainer();
  }

  scrollMessagesContainer() {
    const element = this.element.querySelector('.messages');
    const lastMessage = element.querySelector('.message:last-child');

    if (lastMessage) {
      element.scrollTop = lastMessage.offsetTop + lastMessage.offsetHeight;
    }
  }

  @action
  add() {
    let msg = this.store.createRecord('message',{
      from: 'Me',
      body: 'hello',
      sentAt: new Date(),
      receivedAt: new Date()
    });

    this.set('messages', [...this.messages, msg]);
  }

  @action
  remove() {
    this.messages.pop();
    this.set('messages', [...this.messages])
  }
}
