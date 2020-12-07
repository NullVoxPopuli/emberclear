import type StoreService from '@ember-data/store';

import { getService } from './get-service';

export function getStore(): StoreService {
  return getService('store');
}
