import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';

import LocaleService from 'emberclear/services/locale';
import CurrentUserService from 'emberclear/services/current-user';
import StoreService from 'ember-data/store';

import { ensureRelays, ensureAtLeastOneContact } from 'emberclear/utils/data/required-data';
import Settings from 'emberclear/services/settings';
import ConnectionService from 'emberclear/services/connection';

export default class ApplicationRoute extends Route {
  @service currentUser!: CurrentUserService;
  @service locale!: LocaleService;
  @service settings!: Settings;
  @service connection!: ConnectionService;
  @service store!: StoreService;

  async beforeModel() {
    (this.store as any).shouldTrackAsyncRequests = true;
    (this.store as any).generateStackTracesForTrackedRequests = true;

    await ensureRelays(getOwner(this));

    // TODO: check all the modern web requirements
    this.settings.applyTheme();
    await this.locale.setLocale(this.locale.currentLocale);
    await this.currentUser.load();

    await ensureAtLeastOneContact(getOwner(this));
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
    this.connection.connect();
  }
}
