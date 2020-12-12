import Ember from 'ember';

import type ApplicationInstance from '@ember/application/instance';
import type Relay from 'emberclear/models/relay';

export const defaultRelays = [
  {
    socket: 'wss://mesh-relay-in-us-1.herokuapp.com/socket',
    og: 'https://mesh-relay-in-us-1.herokuapp.com/open_graph',
    host: 'mesh-relay-in-us-1.herokuapp.com',
  },
  // {
  //   socket: 'wss://mesh-relay-eu-1.herokuapp.com/socket',
  //   og: 'https://mesh-relay-eu-1.herokuapp.com/open_graph',
  //   host: 'mesh-relay-eu-1.herokuapp.com',
  // },
  // {
  //   socket: 'ws://localhost:4301/socket',
  //   og: 'http://localhost:4301/open_graph',
  //   host: 'localhost:4301',
  // },
];

export async function ensureRelays(applicationInstance: ApplicationInstance) {
  if (Ember.testing) return;

  const store = applicationInstance.lookup('service:store');
  const existing = await store.findAll('relay');
  const existingHosts = existing.map((e: Relay) => e.host);

  return await Promise.all(
    defaultRelays.map((defaultRelay, i) => {
      if (existingHosts.includes(defaultRelay.host)) {
        return;
      }

      const record = store.createRecord('relay', {
        ...defaultRelay,
        priority: i + 1,
      });

      return record.save();
    })
  );
}
