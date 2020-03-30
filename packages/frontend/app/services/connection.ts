import Service, { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';
import Task from 'ember-concurrency/task';

import ConnectionManager from 'emberclear/services/connection/manager';
import CurrentUserService from 'emberclear/services/current-user';
import ContactsOnlineChecker from 'emberclear/services/contacts/online-checker';
import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import { OutgoingPayload } from 'emberclear/services/connection/connection';

export default class ConnectionService extends Service {
  @service currentUser!: CurrentUserService;
  @service('connection/manager') manager!: ConnectionManager;
  @service('messages/dispatcher') dispatcher!: MessageDispatcher;
  @service('contacts/online-checker') onlineChecker!: ContactsOnlineChecker;

  connect() {
    this._connect.perform();
  }

  disconnect() {
    this.manager.disconnect();
  }

  async getOpenGraph(url: string) {
    return this.manager.getOpenGraph(url);
  }

  async send(payload: OutgoingPayload) {
    let instance = await this.manager.acquire();

    if (instance) {
      await instance.send(payload);
    }
  }

  @(task(function* (this: ConnectionService) {
    let canConnect = yield this.canConnect();

    if (!canConnect) return;

    yield this.manager.setup();

    yield this.dispatcher.pingAll();
    this.onlineChecker.checkOnlineStatus.perform();
  })
    .drop()
    .withTestWaiter())
  private _connect!: Task;

  private canConnect(): Promise<boolean> {
    return this.currentUser.exists();
  }
}

declare module '@ember/service' {
  interface Registry {
    connection: ConnectionService;
  }
}
