import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import IdentityService from 'emberclear/services/identity/service';

interface IModelParams {
  channel_id: string;
}

export default class ChatInChannelRoute extends Route {
  @service identity!: IdentityService;

  async model(params: IModelParams) {
    const { channel_id } = params;

    const targetChannel = await this.store.findRecord('channel', channel_id);

    return {
      targetChannel,
    };
  }
}
