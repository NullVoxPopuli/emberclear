import Service, { inject as service } from '@ember/service';

import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import type { CurrentUserService } from '@emberclear/local-account';
import type { Message } from '@emberclear/networking';
import type ConnectionManager from '@emberclear/networking/services/connection/manager';
import type ContactsOnlineChecker from '@emberclear/networking/services/contacts/online-checker';
import type MessageDispatcher from '@emberclear/networking/services/messages/dispatcher';
import type { OutgoingPayload } from '@emberclear/networking/utils/connection/connection';

type ConnectionHooks = {
  onReceive(message: Message): Promise<unknown>;
};

export default class ConnectionService extends Service {
  @service declare currentUser: CurrentUserService;
  @service('connection/manager') declare manager: ConnectionManager;
  @service('messages/dispatcher') declare dispatcher: MessageDispatcher;
  @service('contacts/online-checker') declare onlineChecker: ContactsOnlineChecker;

  hooks?: ConnectionHooks;

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
