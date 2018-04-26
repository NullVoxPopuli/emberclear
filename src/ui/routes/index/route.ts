import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  // socket = service('relay-connection');

  activate(this: IndexRoute) {
    console.log('transitioned index');
    // super.activate();
    //
    // this.socket.connect();
  }
}
