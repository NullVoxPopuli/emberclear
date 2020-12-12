import { getService } from './get-service';

import type StoreService from '@ember-data/store';

export function getStore(): StoreService {
  return getService('store');
}
