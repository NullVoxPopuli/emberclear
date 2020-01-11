import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';
import CurrentUserService from 'emberclear/services/current-user';

interface IModelParams {
  id: string;
}

export default class ChatInChannelRoute extends Route {
  @service store!: StoreService;
  @service currentUser!: CurrentUserService;
  @service toast!: Toast;
  @service intl!: Intl;

  async model(params: IModelParams) {
    let { id } = params;

    let targetChannel;

    try {
      targetChannel = await this.store.findRecord('channel', id);
    } catch (error) {
      this.toast.error(error || this.intl.t('ui.chat.errors.channelNotFound'));
      this.transitionTo('chat.index');
    }

    return {
      targetChannel,
    };
  }
}
