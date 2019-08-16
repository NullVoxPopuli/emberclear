import Controller from '@ember/controller';
import { action } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import Settings from 'emberclear/services/settings';

export default class InterfaceController extends Controller {
  @service settings!: Settings;

  @alias('settings.useLeftRightJustificationForMessages')
  useLeftRightJustificationForMessages!: boolean;

  @action useDarkTheme() {
    let classList = document.body.classList;

    classList.toggle('dark-theme');
  }
}
