import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

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
    // While these models aren't used directly, we'll be reading
    // from cache deep in the component tree
    const [contacts, channels /*messages*/] = await Promise.all([
      this.store.findAll('identity', { backgroundReload: true }),
      this.store.findAll('channel', { backgroundReload: true }),
      this.store.findAll('message', { backgroundReload: true }),
    ]);

    return { contacts, channels };
  }

  afterModel() {
    this.relayManager.connect();
  }
}
