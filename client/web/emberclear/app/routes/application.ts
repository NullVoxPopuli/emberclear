import { getOwner } from '@ember/application';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { ensureRelays } from 'emberclear/utils/data/required-data';

import type StoreService from '@ember-data/store';
import type ConnectionService from 'emberclear/services/connection';
import type CurrentUserService from 'emberclear/services/current-user';
import type LocaleService from 'emberclear/services/locale';
import type Settings from 'emberclear/services/settings';

export default class ApplicationRoute extends Route {
  @service declare store: StoreService;
  @service declare currentUser: CurrentUserService;
  @service declare locale: LocaleService;
  @service declare settings: Settings;
  @service declare connection: ConnectionService;

  async beforeModel() {
    (this.store as any).shouldTrackAsyncRequests = true;
    (this.store as any).generateStackTracesForTrackedRequests = true;

    // TODO: check all the modern web requirements
    this.settings.applyTheme();

    await this.locale.setLocale(this.locale.currentLocale);
    await ensureRelays(getOwner(this));
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
    if (this.currentUser.isLoggedIn) {
      this.connection.connect();
    }
  }
}
