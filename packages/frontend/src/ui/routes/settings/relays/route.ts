import Route from '@ember/routing/route';

export default class SettingsRelayRoute extends Route {
  async model() {
    const relays = await this.store.findAll('relay');

    return { relays };
  }
}
