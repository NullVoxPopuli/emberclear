import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';
import { task } from 'ember-concurrency';

import { timeout } from 'ember-concurrency';

import RelayConnection from 'emberclear/services/relay-connection';
import Task from 'ember-concurrency/task';

export default class ConnectionStatus extends Component {
  @service relayConnection!: RelayConnection;

  @reads('relayConnection.connected') isConnected!: boolean;
  @reads('relayConnection.status') status!: string;
  @reads('relayConnection.statusLevel') level!: string;

  // TODO: maybe extract the 'when to display this' to a service
  //       as is, whenever you visit a chat, even when you are already
  //       connected, the message shows.
  @action
  didConnect(element) {
    if (this.isConnected) {
      this.setToFade.perform(element);
    } else {
      this.removeFade.perform(element);
    }
  }

  @task(function*(this: ConnectionStatus, element: HTMLElement) {
    yield timeout(2000);

    element.classList.add('fade-out');
  })
  setToFade!: Task;

  @task(function*(this: ConnectionStatus, element: HTMLElement) {
    yield timeout(200);

    element.classList.remove('fade-out');
  })
  removeFade!: Task;
}
