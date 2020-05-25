import Component from '@glimmer/component';
import { action } from '@ember/object';
import StoreService from '@ember-data/store';
import { inject as service } from '@ember/service';

import Relay from 'emberclear/models/relay';
import ArrayProxy from '@ember/array/proxy';
import ConnectionManager from 'emberclear/services/connection/manager';

interface Args {
  relay: Relay;
}

export default class RelayTableRow extends Component<Args> {
  @service store!: StoreService;
  @service('connection/manager') connectionManager!: ConnectionManager;

  get isActive() {
    let pool = this.connectionManager.connectionPool;

    if (!pool) {
      return false;
    }

    let active = pool.activeConnections.map((connection) => connection.relay);

    return active.includes(this.args.relay);
  }

  @action
  remove() {
    let { relay } = this.args;

    relay.deleteRecord();

    return relay.save();
  }

  @action
  async makeDefault() {
    let { relay } = this.args;

    relay.priority = 1;

    await relay.save();

    const relays: ArrayProxy<Relay> = await this.store.findAll('relay');

    let nextHighestPriority = 2;

    let sortedRelays = relays.toArray().sort((r) => r.priority);

    for (let nonDefaultRelay of sortedRelays) {
      if (nonDefaultRelay.id === relay.id) return;

      nonDefaultRelay.priority = nextHighestPriority;
      await nonDefaultRelay.save();
      nextHighestPriority++;
    }
  }
}
