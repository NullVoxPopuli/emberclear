import Service, { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency-decorators';

import ConnectionManager from 'emberclear/services/connection/manager';
import CurrentUserService from 'emberclear/services/current-user';
import ContactsOnlineChecker from 'emberclear/services/contacts/online-checker';
import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import { OutgoingPayload } from 'emberclear/utils/connection/connection';
import { taskFor } from 'emberclear/utils/ember-concurrency';

export default class ConnectionService extends Service {
  @service currentUser!: CurrentUserService;
  @service('connection/manager') manager!: ConnectionManager;
  @service('messages/dispatcher') dispatcher!: MessageDispatcher;
  @service('contacts/online-checker') onlineChecker!: ContactsOnlineChecker;

  connect() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this._connect).perform();
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

  @dropTask({ withTestWaiter: true })
  private async _connect() {
    let canConnect = await this.canConnect();

    if (!canConnect) return;

    await this.manager.setup();

    await this.dispatcher.pingAll();

    return taskFor(this.onlineChecker.checkOnlineStatus).perform();
  }

  private canConnect(): Promise<boolean> {
    return this.currentUser.exists();
  }
}

declare module '@ember/service' {
  interface Registry {
    connection: ConnectionService;
  }
}
