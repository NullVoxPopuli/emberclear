import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SettingsRelayRoute extends Route {
  @service store;

  async model() {
    const relays = await this.store.findAll('relay');

    return { relays };
  }
}
