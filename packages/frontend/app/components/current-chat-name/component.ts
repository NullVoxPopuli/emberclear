import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import StoreService from 'ember-data/store';
import RouterService from '@ember/routing/router-service';
import CurrentUserService, { currentUserId } from 'emberclear/src/services/current-user/service';

const PRIVATE_CHAT_REGEX = /chat\/privately-with\/(.+)/;
const CHANNEL_REGEX = /chat\/in-channel\/(.+)/;

export default class extends Component {
  @service store!: StoreService;
  @service router!: RouterService;
  @service currentUser!: CurrentUserService;

  get isChatVisible() {
    return isPresent(this.chatName);
  }

  get record() {
    if (!this.recordId || !this.recordType) return;

    const record = this.store.peekRecord(this.recordType, this.recordId);

    return record;
  }

  get recordId() {
    return this.contactId || this.channelId;
  }

  get recordType() {
    return this.contactId ? 'contact' : 'channel';
  }

  get contactId() {
    return contactIdFrom(this.router.currentURL);
  }

  get channelId() {
    return channelIdFrom(this.router.currentURL);
  }

  get chatName() {
    if (this.recordId === currentUserId) {
      return this.currentUser.name;
    }

    if (this.recordId) {
      if (this.channelId) {
        return `#${this.record.name}`;
      }

      return `${this.record.name}`;
    }

    return '';
  }
}

function contactIdFrom(url: string) {
  const privateMatches = PRIVATE_CHAT_REGEX.exec(url);
  const encodedId = privateMatches && privateMatches[1];

  if (encodedId) {
    const id = decodeURI(encodedId);
    return id;
  }
}

function channelIdFrom(url: string) {
  const channelMatches = CHANNEL_REGEX.exec(url);
  const encodedId = channelMatches && channelMatches[1];

  if (encodedId) {
    const id = decodeURI(encodedId);
    return id;
  }
}
