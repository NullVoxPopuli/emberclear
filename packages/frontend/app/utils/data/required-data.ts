import Ember from 'ember';
import Relay from 'emberclear/models/relay';
import ApplicationInstance from '@ember/application/instance';

const NVP_PK = 'bcd75a243e988bdfb9b19aaf1d3af2b7a02826a7a94c4ed2915481f825dddf62';

export async function ensureAtLeastOneContact(owner: ApplicationInstance) {
  if (Ember.testing) return;

  let currentUser = owner.lookup('service:currentUser');

  if (currentUser.record.uid === NVP_PK) return;

  let contactManager = owner.lookup('service:contact-manager');

  await contactManager.findOrCreate(NVP_PK, 'NullVoxPopuli');
}

export const defaultRelays = [
  // {
    // socket: 'wss://mesh-relay-in-us-1.herokuapp.com/socket',
    // og: 'https://mesh-relay-in-us-1.herokuapp.com/open_graph',
    // host: 'mesh-relay-in-us-1.herokuapp.com',
  // },
  // {
    // socket: 'wss://mesh-relay-eu-1.herokuapp.com/socket',
    // og: 'https://mesh-relay-eu-1.herokuapp.com/open_graph',
    // host: 'mesh-relay-eu-1.herokuapp.com',
  // },
  {
    socket: 'ws://localhost:4301/socket',
    og: 'http://localhost:4301/open_graph',
    host: 'localhost:4301',
  },
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
