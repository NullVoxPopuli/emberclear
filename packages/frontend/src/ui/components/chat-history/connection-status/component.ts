import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { reads } from '@ember-decorators/object/computed';
// import { task } from 'ember-concurrency-decorators';
import { task } from 'ember-concurrency';

import { timeout } from 'ember-concurrency';

import RelayConnection from 'emberclear/src/services/relay-connection';

export default class ConnectionStatus extends Component {
  @service relayConnection!: RelayConnection;

  @reads('relayConnection.connected') isConnected!: boolean;
  @reads('relayConnection.status') status!: string;
  @reads('relayConnection.statusLevel') level!: string;

  // TODO: maybe extract the 'when to display this' to a service
  //       as is, whenever you visit a chat, even when you are already
  //       connected, the message shows.
  didRender() {
    if (this.isConnected) {
      this.get('setToFade').perform();
    } else {
      this.get('removeFade').perform();
    }
  }

  // @task * setToFade() {
  setToFade = task(function*(this: ConnectionStatus) {
    yield timeout(2000);

    this.element.classList.add('fade-out');
  // }
  });

  // @task * removeFade() {
  removeFade = task(function*(this: ConnectionStatus) {
    yield timeout(200);

    this.element.classList.remove('fade-out');
  // }
  });
}
