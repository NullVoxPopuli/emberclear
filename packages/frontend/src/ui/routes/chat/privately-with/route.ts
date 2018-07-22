import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import { IModel as ChatModel } from 'emberclear/ui/routes/chat/route';

import { disableInFastboot } from 'emberclear/src/utils/decorators';

interface IModelParams {
  uId: string;
}

export default class ChatPrivatelyRoute extends Route {
  @service identity!: IdentityService;

  @disableInFastboot
  beforeModel(transition: Transition) {
    const params = transition.params['chat.privately-with'];
    const { uId } = params as IModelParams;

    if (uId === this.identity.uid) {
      this.transitionTo('chat.privately-with', 'me');
    }
  }

  @disableInFastboot
  async model(params: IModelParams) {
    const { uId } = params;

    const record = await this.store.findRecord('identity', uId);
    const chatModel = this.modelFor('chat') as ChatModel;

    return RSVP.hash({
      targetIdentity: record,
      messages: chatModel.messages
    });
  }
}
