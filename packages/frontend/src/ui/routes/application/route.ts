import RSVP from 'rsvp';
import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IntlService from 'ember-intl/services/intl';
import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';

export default class ApplicationRoute extends Route {
  @service identity!: IdentityService;
  @service relayConnection!: RelayConnection;
  @service fastboot!: FastBoot;
  @service intl!: IntlService;

  // TODO: ask to turn on notifications
  // TODO: use that same UI (that slack uses)
  //       for other important things, like.. "disconnected, retrying in..."
  async beforeModel() {
    // TODO: make configurable
    const locale = 'en-us';

    this.intl.setLocale([locale]);

    if (this.fastboot.isFastBoot) { return; }

    await this.identity.load();

    const loader = document.querySelector('#app-loader');

    if (loader) {
      loader.remove();
    }
  }

  async model() {
    if (this.fastboot.isFastBoot) return;

    const contacts = this.store.findAll('identity', { backgroundReload: true });

    return RSVP.hash({ contacts });
  }

  async afterModel() {
    if (this.fastboot.isFastBoot) return;

    this.relayConnection.connect();
  }
}
