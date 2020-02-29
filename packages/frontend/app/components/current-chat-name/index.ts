import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';

import CurrentChatService from 'emberclear/services/current-chat';

export default class extends Component {
  @service currentChat!: CurrentChatService;

  get isChatVisible() {
    return isPresent(this.currentChat.name);
  }
}
