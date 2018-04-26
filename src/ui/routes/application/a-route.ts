import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class Application extends Route.extend({
  // anything which *must* be merged to prototype here
  init() {
    console.log('hi');
  }
}) {
  socket = service('relay-connection');

  activate() {
    console.log('hi');
    this.socket.connect();
  }
}
