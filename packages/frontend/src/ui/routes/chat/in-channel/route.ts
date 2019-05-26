import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user/service';

interface IModelParams {
  channel_id: string;
}

export default class ChatInChannelRoute extends Route {
  @service currentUser!: CurrentUserService;

  async model(params: IModelParams) {
    const { channel_id } = params;

    const targetChannel = await this.store.findRecord('channel', channel_id);

    return {
      targetChannel,
    };
  }
}
