import { getOwner } from '@ember/application';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { ensureRelays } from '@emberclear/networking';

import type ArrayProxy from '@ember/array/proxy';
import type StoreService from '@ember-data/store';
import type { CurrentUserService } from '@emberclear/local-account';
import type Channel from '@emberclear/local-account/models/channel';
import type Contact from '@emberclear/local-account/models/contact';
import type { ConnectionService, Message } from '@emberclear/networking';
import type LocaleService from 'emberclear/services/locale';
import type Notifications from 'emberclear/services/notifications';
import type Settings from 'emberclear/services/settings';

interface Model {
  contacts: ArrayProxy<Contact>;
  channels: ArrayProxy<Channel>;
}

export default class ApplicationRoute extends Route {
  @service declare store: StoreService;
  @service declare currentUser: CurrentUserService;
  @service declare locale: LocaleService;
  @service declare notifications: Notifications;
  @service declare intl: Intl;
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

  async model(): Promise<Model> {
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
      this.connection.hooks = {
        onReceive: async (message: Message) => {
          if (message.sender) {
            let name = message.sender.name;
            let msg = this.intl.t('ui.notifications.from', { name });

            await this.notifications.info(msg);
          }
        },
      };
    }
  }
}
