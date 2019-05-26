import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

import LocaleService from 'emberclear/src/services/locale';
import RelayManager from 'emberclear/services/relay-manager';
import CurrentUserService from 'emberclear/services/current-user/service';

import { ensureRelays } from 'emberclear/src/utils/data/required-data';
import { runMigrations } from 'emberclear/src/utils/migrations';

export default class ApplicationRoute extends Route {
  @service currentUser!: CurrentUserService;
  @service relayManager!: RelayManager;
  @service locale!: LocaleService;

  async beforeModel() {
    await runMigrations(getOwner(this));
    await ensureRelays(getOwner(this));

    // TODO: check all the modern web requirements
    await this.locale.setLocale(this.locale.currentLocale);
    await this.currentUser.load();
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
