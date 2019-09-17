import Service from '@ember/service';
import { inject as service } from '@ember/service';

import CurrentUserService from 'emberclear/services/current-user';

import ReceivedMessageHandler from 'emberclear/services/messages/handler';

import { decryptFromSocket } from './-utils/decryptor';
import { task } from 'ember-concurrency';
import Task from 'ember-concurrency/task';

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
    this._receive.perform(socketData);
  }

  @(task(function*(this: MessageProcessor, socketData: RelayMessage) {
    const decrypted = yield decryptFromSocket(socketData, this.currentUser.privateKey!);

    yield this.handler.handle(decrypted);
  })
    .enqueue()
    .maxConcurrency(1)
    .withTestWaiter())
  private _receive!: Task;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'messages/processor': MessageProcessor;
  }
}
