import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route.extend({
  relaySocket: service('relay-connection')
}) {
  

  activate(this: ApplicationRoute) {
    console.log(this.relaySocket);
    console.log(this.get('relaySocket'));
    this.relaySocket.connect();
  }
}
