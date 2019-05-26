import StoreService from 'ember-data/store';

import { getService } from './get-service';

export function getStore(): StoreService {
  return getService<StoreService>('store');
}
