import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import IntlService from 'ember-intl/services/intl';
import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';

import { disableInFastboot } from 'emberclear/src/utils/decorators';

export default class ApplicationRoute extends Route {
  @service identity!: IdentityService;
  @service relayConnection!: RelayConnection;
  @service fastboot!: FastBoot;
  @service intl!: IntlService;

  async beforeModel() {
    // TODO: check all the modern web requirements
    // TODO: make configurable
    const locale = 'en-us';

    this.intl.setLocale([locale]);

    if (this.fastboot.isFastBoot) { return; }

    await this.identity.load();

    this.removeAppLoader();
  }

  @disableInFastboot({ default: { contacts: [], channels: [] } })
  async model() {
    const contacts = await this.store.findAll('identity', { backgroundReload: true });
    const channels = await this.store.findAll('channel', { backgroundReload: true });

    return { contacts, channels };
  }

  @disableInFastboot
  afterModel() {
    this.relayConnection.connect();
  }

  @disableInFastboot
  private removeAppLoader() {
    const loader = document.querySelector('#app-loader');

    if (loader) {
      loader.remove();
    }
  }
}
