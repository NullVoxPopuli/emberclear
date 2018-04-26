import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  // socket: service('relay-connection'),

  activate() {
    console.log('hi');
    // this.socket.connect();
  }
});
