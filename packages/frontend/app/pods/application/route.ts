import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

import LocaleService from 'emberclear/services/locale';
import RelayManager from 'emberclear/services/relay-manager';
import CurrentUserService from 'emberclear/services/current-user';

import { ensureRelays } from 'emberclear/utils/data/required-data';
import { runMigrations } from 'emberclear/utils/migrations';
import Settings from 'emberclear/services/settings';

export default class ApplicationRoute extends Route {
  @service currentUser!: CurrentUserService;
  @service relayManager!: RelayManager;
  @service locale!: LocaleService;
  @service settings!: Settings;

  async beforeModel() {
    await runMigrations(getOwner(this));
    await ensureRelays(getOwner(this));

    // TODO: check all the modern web requirements
    this.settings.applyTheme();
    await this.locale.setLocale(this.locale.currentLocale);
    await this.currentUser.load();
  }

  async model() {
    // While these models aren't used directly, we'll be reading
    // from cache deep in the component tree
    const [contacts, channels /*messages*/] = await Promise.all([
      this.store.findAll('contact', { backgroundReload: true }),
      this.store.findAll('channel', { backgroundReload: true }),
      this.store.findAll('message', { backgroundReload: true }),
    ]);

    return { contacts, channels };
  }

  afterModel() {
    this.relayManager.connect();
  }
}
