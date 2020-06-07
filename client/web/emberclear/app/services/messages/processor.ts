import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { enqueueTask } from 'ember-concurrency-decorators';

import CurrentUserService from 'emberclear/services/current-user';
import ReceivedMessageHandler from 'emberclear/services/messages/handler';
import { taskFor } from 'emberclear/utils/ember-concurrency';

export default class MessageProcessor extends Service {
  @service currentUser!: CurrentUserService;
  @service('messages/handler') handler!: ReceivedMessageHandler;

  /**
   * Because we could potentially be receiving multiple
   * messages from a new contact, we need to queue multiple
   * calls to receive.
   *
   * Without queueing them, we can run in to concurrency issues
   * when interacting with the ember-data store / any "saving"
   * behavior.
   *
   */
  receive(socketData: RelayMessage) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this._receive).perform(socketData);
  }

  @enqueueTask({ withTestWaiter: true, maxConcurrency: 1 })
  async _receive(socketData: RelayMessage) {
    const decrypted = await this.currentUser.crypto?.decryptFromSocket(socketData);

    await this.handler.handle(decrypted);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/processor': MessageProcessor;
  }
}
