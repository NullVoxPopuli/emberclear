import Component from '@ember/component';
import { action } from '@ember-decorators/object';

export default class SnippetModal extends Component {
  text = '';
  title = '';
  language = '';

  @action
  sendMessage() {
    console.log('TODO: refactor the existing sendMessage from chat-entry and use here');
  }
}
