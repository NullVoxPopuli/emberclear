import Ember from 'ember';
export const defaultRelays = [
  {
    socket: 'wss://mesh-relay-in-us-1.herokuapp.com/socket',
    og: 'https://mesh-relay-in-us-1.herokuapp.com/open_graph',
    host: 'mesh-relay-in-us-1.herokuapp.com',
  },
  {
    socket: 'wss://mesh-relay-eu-1.herokuapp.com/socket',
    og: 'https://mesh-relay-eu-1.herokuapp.com/open_graph',
    host: 'mesh-relay-eu-1.herokuapp.com',
  },
  {
    socket: 'ws://localhost:4301/socket',
    og: 'http://localhost:4301/open_graph',
    host: 'localhost:4301',
  },
];

export async function initialize(applicationInstance: any) {
  if (Ember.testing) return;

  const store = applicationInstance.lookup('service:store');
  const existing = await store.findAll('relay');
  const existingHosts = existing.map(e => e.host);

  return await Promise.all(
    defaultRelays.map(defaultRelay => {
      if (existingHosts.includes(defaultRelay.host)) {
        return;
      }

      const record = store.createRecord('relay', defaultRelay);
      return record.save();
    })
  );
}

export default { initialize };
