import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import StoreService from '@ember-data/store';

export default class SettingsRelayRoute extends Route {
  @service declare store: StoreService;

  async model() {
    const relays = await this.store.findAll('relay');

    return { relays };
  }
}
