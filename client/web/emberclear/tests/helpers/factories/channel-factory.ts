import { getService } from '@emberclear/test-helpers/test-support';

export async function createChannel(name: string, attributes = {}) {
  let store = getService('store');

  let record = store.createRecord('channel', {
    name,
    // channels aren't implemented, so I don't know
    // what other defaults would be good here
    ...attributes,
  });

  await record.save();

  return record;
}
