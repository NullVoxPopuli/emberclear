import StoreService from 'ember-data/store';
import Service from '@ember/service';
import { inject as service } from '@ember/service';

import Relay from 'emberclear/models/relay';
import ToastService from 'emberclear/services/toast';
import CurrentUserService from 'emberclear/services/current-user';

import ArrayProxy from '@ember/array/proxy';
import { pool, ConnectionPool } from 'emberclear/utils/connection-pool';
import { Connection } from 'emberclear/services/connection/connection';
import MessageProcessor from 'emberclear/services/messages/processor';

export default class ConnectionManager extends Service {
  @service toast!: ToastService;
  @service store!: StoreService;
  @service('messages/processor') processor!: MessageProcessor;
  @service currentUser!: CurrentUserService;

  connectionPool?: ConnectionPool<Connection, Relay>;

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

    let json = await response.json();

    return (json || {}).data;
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

      create: async endpoint => {
        let instance = new Connection({
          relay: endpoint,
          publicKey: this.currentUser.uid,
          onData: this.processor.receive.bind(this.processor),
        });

        // Do connect / subscribe, etc
        await instance.connect();

        return instance;
      },
      destroy: instance => instance.destroy(),
      isOk: instance => instance.isConnected,

      minConnections: 1,
    });
  }

  destroy() {
    if (this.connectionPool) {
      this.connectionPool.drain();
    }

    return super.destroy();
  }
}

declare module '@ember/service' {
  interface Registry {
    'connection/manager': ConnectionManager;
  }
}
