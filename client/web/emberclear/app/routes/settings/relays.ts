import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type ArrayProxy from '@ember/array/proxy';
import type StoreService from '@ember-data/store';
import type { Relay } from '@emberclear/networking';

export interface Model {
  relays: ArrayProxy<Relay>;
}

export default class SettingsRelayRoute extends Route {
  @service declare store: StoreService;

  async model(): Promise<Model> {
    const relays = await this.store.findAll('relay');

    return { relays };
  }
}
