import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { Connection } from 'emberclear/utils/connection/connection';
import { pool } from 'emberclear/utils/connection/connection-pool';

import type ArrayProxy from '@ember/array/proxy';
import type StoreService from '@ember-data/store';
import type Relay from 'emberclear/models/relay';
import type ConnectionStatusService from 'emberclear/services/connection/status';
import type CurrentUserService from 'emberclear/services/current-user';
import type MessageProcessor from 'emberclear/services/messages/processor';
import type ToastService from 'emberclear/services/toast';
import type { ConnectionPool, STATUS } from 'emberclear/utils/connection/connection-pool';

export default class ConnectionManager extends Service {
  @service declare toast: ToastService;
  @service declare store: StoreService;
  @service('messages/processor') declare processor: MessageProcessor;
  @service('connection/status') declare status: ConnectionStatusService;
  @service declare currentUser: CurrentUserService;

  declare connectionPool?: ConnectionPool<Connection, Relay>;

  async getOpenGraph(url: string): Promise<OpenGraphData> {
    if (!this.connectionPool) {
      return {};
    }

    let connection = await this.connectionPool.acquire();
    let safeUrl = encodeURIComponent(url);
    let ogUrl = `${connection.relay.og}?url=${safeUrl}`;

    let response = await fetch(ogUrl, {
      credentials: 'omit',
      referrer: 'no-referrer',
      cache: 'no-cache',
      headers: {
        ['Accept']: 'application/json',
      },
    });

    try {
      let json = await response.json();

      return (json || {}).data;
    } catch (e) {
      return {};
    }
  }

  acquire() {
    if (!this.connectionPool) {
      return;
    }

    return this.connectionPool.acquire();
  }

  async setup() {
    if (this.connectionPool) {
      return;
    }

    let relays: ArrayProxy<Relay> = await this.store.findAll('relay');

    // TODO:
    //   figure out how to handle message received concurrency.
    //   - what happens if the connection pool is all connected to
    //     the same relay?
    //   - should we prevent the ability to connect to the same relay
    //     multiple times
    //   - what happens if we can't mean our min-connections?
    this.connectionPool = await pool<Connection, Relay>({
      endpoints: relays.toArray(),

      create: this.createConnection.bind(this),
      destroy: (instance) => instance.destroy(),
      isOk: (instance) => instance.isConnected,
      onStatusChange: this.updateStatus.bind(this),

      minConnections: 1,
    });
  }

  disconnect() {
    if (this.connectionPool) {
      this.connectionPool.drain();
    }
  }

  willDestroy() {
    this.disconnect();

    return super.destroy();
  }

  private updateStatus(status: STATUS) {
    this.status.updateStatus(status);
  }

  private async createConnection(relay: Relay) {
    let instance = new Connection({
      relay,
      publicKey: this.currentUser.uid,
      onData: this.processor.receive.bind(this.processor),
      onInfo: (info) => {
        // TODO: Temporary
        // TODO: This needs to be pulled out into a web worker (the whole class)
        // TODO: don't set these directly on the relay?
        Object.assign(relay, info);
      },
    });

    // Do connect / subscribe, etc
    await instance.connect();

    return instance;
  }
}

declare module '@ember/service' {
  interface Registry {
    'connection/manager': ConnectionManager;
  }
}
