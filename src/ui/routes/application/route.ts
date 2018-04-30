import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  relaySocket = service('relay-connection');
  toast = service('toast');

  activate(this: ApplicationRoute) {
    this.get('relaySocket').connect();
    this.get('toast').success('hello');
  }
}
