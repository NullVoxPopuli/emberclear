import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { enqueueTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import type { EncryptedMessage } from '@emberclear/crypto/types';
import type { CurrentUserService } from '@emberclear/local-account';
import type { ConnectionService } from '@emberclear/networking';
import type ReceivedMessageHandler from '@emberclear/networking/services/messages/handler';
import type { P2PMessage } from '@emberclear/networking/types';

export default class MessageProcessor extends Service {
  @service declare currentUser: CurrentUserService;
  @service('messages/handler') declare handler: ReceivedMessageHandler;
  @service declare connection: ConnectionService;

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
  receive(socketData: EncryptedMessage) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this._receive).perform(socketData);
  }

  @enqueueTask({ withTestWaiter: true, maxConcurrency: 1 })
  async _receive(socketData: EncryptedMessage) {
    const decrypted = await this.currentUser.crypto.decryptFromSocket<P2PMessage>(socketData);

    let message = await this.handler.handle(decrypted);

    if (message) {
      await this.connection.hooks?.onReceive(message);
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'messages/processor': MessageProcessor;
  }
}
