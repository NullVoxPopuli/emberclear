import RSVP from 'rsvp';
import Route from '@ember/routing/route';

import { IModel as ChatModel } from 'emberclear/ui/routes/chat/route';

interface IModelParams {
  uId: string;
}

export default class ChatPrivatelyRoute extends Route {
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
