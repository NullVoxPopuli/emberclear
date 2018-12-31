import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import LocaleService from 'emberclear/src/services/locale';
import RelayManager from 'emberclear/services/relay-manager';
import IdentityService from 'emberclear/services/identity/service';

export default class ApplicationRoute extends Route {
  @service identity!: IdentityService;
  @service relayManager!: RelayManager;
  @service locale!: LocaleService;

  async beforeModel() {
    // TODO: check all the modern web requirements
    await this.locale.setLocale(this.locale.currentLocale);
    await this.identity.load();
  }

  async model() {
    const contacts = await this.store.findAll('identity', { backgroundReload: true });
    const channels = await this.store.findAll('channel', { backgroundReload: true });

    return { contacts, channels };
  }

  afterModel() {
    this.relayManager.connect();
  }
}
