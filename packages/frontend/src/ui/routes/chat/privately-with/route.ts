import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IdentityService from 'emberclear/services/identity/service';
import { IModel as ChatModel } from 'emberclear/ui/routes/chat/route';

interface IModelParams {
  uId: string;
}

export default class ChatPrivatelyRoute extends Route {
  @service identity!: IdentityService;

  beforeModel(transition: Transition) {
    const params = transition.params['chat.privately-with'];
    const { uId } = params as IModelParams;

    if (uId === this.identity.uid) {
      this.transitionTo('chat.privately-with', 'me');
    }
  }

  // Two scenarios
  //  - to: the uId from the current user
  //  - from the uId and to the currentUser
  async model(params: IModelParams) {
    const { uId } = params;

    const record = await this.store.findRecord('identity', uId);
    const chatModel = this.modelFor('chat') as ChatModel;

    return RSVP.hash({
      uid: uId,
      targetIdentity: record,
      messages: chatModel.messages
    });
  }
}
