import Controller from '@ember/controller';
import { computed } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';


export default class SetupCompletedController extends Controller {
  @service i18n!: I18n;

  @computed('model')
  get mnemonic() {
    if (!this.model) { return this.i18n.t('services.crypto.keyGenFailed'); }

    return this.model;
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
  interface Registry {
    'setup-completed': SetupCompletedController;
  }
}
