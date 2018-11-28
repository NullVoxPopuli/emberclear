import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import LocaleService from 'emberclear/src/services/locale';
import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';

export default class ApplicationRoute extends Route {
  @service identity!: IdentityService;
  @service relayConnection!: RelayConnection;
  @service locale!: LocaleService;

  async beforeModel() {
    // TODO: check all the modern web requirements
    await this.locale.setLocale(this.locale.currentLocale);
    await this.identity.load();

    this.removeAppLoader();
  }

  async model() {
    const contacts = await this.store.findAll('identity', { backgroundReload: true });
    const channels = await this.store.findAll('channel', { backgroundReload: true });

    return { contacts, channels };
  }

  afterModel() {
    this.relayConnection.connect();
  }

  private removeAppLoader() {
    const loader = document.querySelector('#app-loader');

    if (loader) {
      loader.remove();
    }
  }
}
