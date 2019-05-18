import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { alias, equal } from '@ember/object/computed';
import { isPresent } from '@ember/utils';
import StoreService from 'ember-data/store';
import RouterService from '@ember/routing/router-service';
import CurrentUserService, { currentUserId } from 'emberclear/src/services/current-user/service';

const PRIVATE_CHAT_REGEX = /chat\/privately-with\/(.+)/;
const CHANNEL_REGEX = /chat\/in-channel\/(.+)/;

export default class extends Component {
  @service currentUser!: CurrentUserService;
  @service store!: StoreService;
  @service router!: RouterService;

  @alias('router.currentRouteName') routeName!: string;
  @equal('routeName', 'chat.index') isRootChat!: boolean;

  get chatName() {
    const url = this.router.currentURL;
    const privateMatches = PRIVATE_CHAT_REGEX.exec(url);

    // Private Chat
    if (privateMatches) {
      const encodedId = privateMatches[1];
      const id = decodeURI(encodedId);

      if (id === currentUserId) {
        return this.currentUser.name;
      }

      return this.getName(id, 'contact');
    }

    const channelMatches = CHANNEL_REGEX.exec(url);

    if (channelMatches) {
      const encodedId = channelMatches[1];
      const id = decodeURI(encodedId);

      return this.getName(id, 'channel', '#');
    }

    return '';
  }

  get isChatVisible() {
    return isPresent(this.chatName);
  }

  getName(id: string, modelType: string, prefix = '') {
    const record = this.store.peekRecord(modelType, id);

    return `${prefix}${record.name}`;
  }
}
