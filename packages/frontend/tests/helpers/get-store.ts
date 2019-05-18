import DS from 'ember-data';

import { getService } from './get-service';

export function getStore(): DS.Store {
  return getService<DS.Store>('store');
}
