import Component from '@glimmer/component';
import StoreService from 'ember-data/store';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

import Relay from 'emberclear/models/relay';
import RelayConnection from 'emberclear/services/relay-connection';
import ArrayProxy from '@ember/array/proxy';

interface IArgs {
  relays: Relay[];
}

export default class RelayTable extends Component<IArgs> {
  @service store!: StoreService;
  @service relayConnection!: RelayConnection;

  @reads('relayConnection.relay') activeRelay!: Relay;

  remove(relay: Relay) {
    relay.deleteRecord();

    return relay.save();
  }

  async makeDefault(relay: Relay) {
    relay.set('priority', 1);
    relay.save();

    const relays: ArrayProxy<Relay> = await this.store.findAll('relay');

    let nextHighestPriority = 2;

    relays
      .toArray()
      .sort(r => r.priority)
      .forEach(nonDefaultRelay => {
        if (nonDefaultRelay.id === relay.id) return;

        nonDefaultRelay.set('priority', nextHighestPriority);
        nonDefaultRelay.save();
        nextHighestPriority++;
      });
  }
}
