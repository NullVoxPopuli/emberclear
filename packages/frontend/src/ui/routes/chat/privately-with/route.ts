import RSVP from 'rsvp';
import Route from '@ember/routing/route';

export default class ChatPrivatelyRoute extends Route {
  async model(params) {
    const { uId } = params;

    const record = await this.store.findRecord('identity', uId);
    const chatModel = this.modelFor('chat');

    return RSVP.hash({
      targetIdentity: record,
      messages: chatModel.messages
    });
  }
}
