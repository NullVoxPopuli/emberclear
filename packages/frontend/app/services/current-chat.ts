import Service, { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import RouterService from '@ember/routing/router-service';
import CurrentUserService, { currentUserId } from 'emberclear/services/current-user';

import { PRIVATE_CHAT_REGEX, CHANNEL_REGEX } from 'emberclear/utils/route-matchers';

export default class CurrentChatService extends Service {
  @service store!: StoreService;
  @service router!: RouterService;
  @service currentUser!: CurrentUserService;

  get name() {
    if (this.recordId === currentUserId) {
      return this.currentUser.name;
    }

    if (this.recordId) {
      if (this.channelId) {
        return `#${this.record?.name}`;
      }

      return `${this.record?.name}`;
    }

    return '';
  }

  get record() {
    if (!this.recordId || !this.recordType) return;

    const record = this.store.peekRecord(this.recordType, this.recordId);

    return record;
  }

  // private

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
}

function contactIdFrom(url: string) {
  const privateMatches = PRIVATE_CHAT_REGEX.exec(url);
  const encodedId = privateMatches?.[1];

  if (encodedId) {
    const id = decodeURI(encodedId);

    return id;
  }
}

function channelIdFrom(url: string) {
  const channelMatches = CHANNEL_REGEX.exec(url);
  const encodedId = channelMatches?.[1];

  if (encodedId) {
    const id = decodeURI(encodedId);

    return id;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    currentChat: CurrentChatService;
  }
}
