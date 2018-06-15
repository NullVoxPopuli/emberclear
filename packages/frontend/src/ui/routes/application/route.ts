import Route from '@ember/routing/route';
import { service } from '@ember-decorators/service';

import RelayConnection from 'emberclear/services/relay-connection';
import IdentityService from 'emberclear/services/identity/service';
import EmberclearIntl from 'emberclear/services/intl';

export default class ApplicationRoute extends Route {
  @service identity!: IdentityService;
  @service relayConnection!: RelayConnection;
  @service fastboot!: FastBoot;
  @service intl!: EmberclearIntl;

  async beforeModel() {
    // TODO: make configurable
    const locale = 'en-us';

    await this.intl.loadTranslations(locale);

    this.intl.setLocale(locale);

    if (this.fastboot.isFastBoot) return;

    await this.identity.load();
  }

  async activate(this: ApplicationRoute) {

    // setInterval(() => {
    //   navigator.serviceWorker && navigator.serviceWorker.getRegistration()
    //     .then(registration => registration && registration.update());
    // }, 60000);


    // window.addEventListener("beforeinstallprompt", function(e) {
    //   // log the platforms provided as options in an install prompt
    //   console.log(e.platforms); // e.g., ["web", "android", "windows"]
    //   e.userChoice.then(function(outcome) {
    //     console.log(outcome); // either "accepted" or "dismissed"
    //   }, handleError);
    // });
  }
}
