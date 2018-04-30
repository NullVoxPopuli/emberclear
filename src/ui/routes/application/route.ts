import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  relaySocket = service('relay-connection');

  activate(this: ApplicationRoute) {
    // this.get('relaySocket').connect();
    this.get('toast').success('hello');
  }
}
