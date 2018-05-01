import Route from '@ember/routing/route';

import { service } from '@ember-decorators/service';

export default class ApplicationRoute extends Route {
  @service('relay-connection') relaySocket;
  // @service('toast') toast;

  activate(this: ApplicationRoute) {
    this.relaySocket.connect();

    // this.toast.success('hello');
  }
}
