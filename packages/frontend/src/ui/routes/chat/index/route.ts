import Route from '@ember/routing/route';

export default class ChatIndexRoute extends Route {
  model() {
    return this.modelFor('chat');
  }
}
