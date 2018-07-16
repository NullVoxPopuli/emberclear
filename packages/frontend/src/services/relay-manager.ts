import DS from 'ember-data';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';

export default class RelayManager extends Service {
  @service store!: DS.Store;

  getRelay() {
    // randomly select one that is online?
    return this.populateStoreWithPreconfiguredRelays();
  }

  async getOpenGraph(url: string): Promise<OpenGraphData> {
    const baseUrl = this.getRelay().og;
    const safeUrl = encodeURIComponent(url);
    const ogUrl = `${baseUrl}?url=${safeUrl}`;
    const response = await fetch(ogUrl, {
      credentials: 'omit',
      referrer: 'no-referrer',
      cache: 'no-cache',
      headers: {
        ['Accept']: 'application/json'
      }
    });

    const json = await response.json();

    return (json || {}).data;
  }

  // TODO: these need to be 'find or create'
  populateStoreWithPreconfiguredRelays() {
    return this.store.createRecord('relay', {
      socket: 'wss://mesh-relay-in-us-1.herokuapp.com/socket',
      og: 'https://mesh-relay-in-us-1.herokuapp.com/open_graph',
      host: 'mesh-relay-in-us-1.herokuapp.com'
    });
  }


}

declare module '@ember/service' {
  interface Registry {
    'relay-manager': RelayManager
  }
}
