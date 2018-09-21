import RSVP from 'rsvp';
import DS from 'ember-data';
import Component from '@ember/component';

import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';
import { alias, equal } from '@ember-decorators/object/computed';
import { PromiseMonitor } from 'ember-computed-promise-monitor';

const PRIVATE_CHAT_REGEX = /chat\/privately-with\/(.+)/;
const CHANNEL_REGEX = /chat\/in-channel\/(.+)/;


export default class extends Component {
  @service store!: DS.Store;
  @service router!: Router;
  @service fastboot!: FastBoot;

  @alias('router.currentRouteName') routeName!: string;
  @equal('routeName', 'chat.index') isRootChat!: boolean;

  @computed('router.currentURL')
  get chatName() {
    if (this.fastboot.isFastBoot) return;

    const url = this.router.currentURL;
    const privateMatches = PRIVATE_CHAT_REGEX.exec(url);

    // Private Chat
    if (privateMatches) {
      const encodedId = privateMatches[1];
      const id = decodeURI(encodedId);

      return this.getName(id, 'identity');
    }

    const channelMatches = CHANNEL_REGEX.exec(url);

    if (channelMatches) {
      const encodedId = channelMatches[1];
      const id = decodeURI(encodedId);

      return this.getName(id, 'channel', '#');
    }

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

  getName(id: string, modelType: string, prefix = '') {
    const promise: Promise<string> = new RSVP.Promise(async (resolve /*, reject */) => {
      const record = await this.store.findRecord(modelType, id);

      resolve(`${prefix}${record.name}`);
    });

    return new PromiseMonitor<string>(promise);
  }

}
