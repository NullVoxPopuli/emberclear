import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import { IModel as ChatModel } from 'emberclear/ui/routes/chat/route';

import { disableInFastboot } from 'emberclear/src/utils/decorators';

interface IModelParams {
  u_id: string;
}

export default class ChatPrivatelyRoute extends Route {
  @service identity!: IdentityService;

  @disableInFastboot
  beforeModel(transition: any) {
    const params = transition.params['chat.privately-with'];
    const { u_id } = params as IModelParams;

    if (u_id === this.identity.uid) {
      this.transitionTo('chat.privately-with', 'me');
    }
  }

  @disableInFastboot
  async model(params: IModelParams) {
    const { u_id } = params;

    const record = await this.store.findRecord('identity', u_id);
    const chatModel = this.modelFor('chat') as ChatModel;

    return RSVP.hash({
      targetIdentity: record,
      messages: chatModel.messages
    });
  }
}
