import RSVP from 'rsvp';
import DS from 'ember-data';
import Component from '@ember/component';

import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';

import PromiseMonitor from 'emberclear/src/utils/promise-monitor';

const PRIVATE_CHAT_REGEX = /chat\/privately-with\/(.+)/;


export default class extends Component {
  @service store!: DS.Store;
  @service router!: Router;
  @service fastboot!: FastBoot;

  @computed('router.currentURL')
  get chatName() {
    if (this.fastboot.isFastBoot) return;

    const url = this.router.currentURL;
    const matches = PRIVATE_CHAT_REGEX.exec(url);

    // Private Chat
    if (matches) {
      const uid = matches[1];

      return this.getName(uid);
    }

    // TODO: Channels

    return '';
  }

  @computed('chatName.isPending', 'chatName.result')
  get isChatVisible() {
    const name = this.chatName;

    if (name instanceof PromiseMonitor) {
      return (
        !name.isPending &&
        name.result !== ''
      );
    }

    return false;
  }

  getName(uid: string) {
    const promise: Promise<string> = new RSVP.Promise(async (resolve /*, reject */) => {
      const record = await this.store.findRecord('identity', uid);

      resolve(record.name);
    });

    return new PromiseMonitor<string>(promise);
  }

}
