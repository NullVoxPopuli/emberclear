import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type StoreService from '@ember-data/store';
import type CurrentUserService from 'emberclear/services/current-user';

interface IModelParams {
  id: string;
}

export default class ChatInChannelRoute extends Route {
  @service declare store: StoreService;
  @service declare currentUser: CurrentUserService;
  @service declare toast: Toast;
  @service declare intl: Intl;

  async model(params: IModelParams) {
    let { id } = params;

    let targetChannel;

    try {
      targetChannel = await this.store.findRecord('channel', id);
    } catch (error) {
      this.toast.error(error || this.intl.t('ui.chat.errors.channelNotFound'));
      await this.transitionTo('chat.index');
    }

    return {
      targetChannel,
    };
  }
}
