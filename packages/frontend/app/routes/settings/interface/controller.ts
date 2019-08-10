import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import Settings from 'emberclear/services/settings';

export default class InterfaceController extends Controller {
  @service settings!: Settings;

  @alias('settings.useLeftRightJustificationForMessages')
  useLeftRightJustificationForMessages!: boolean;
}
