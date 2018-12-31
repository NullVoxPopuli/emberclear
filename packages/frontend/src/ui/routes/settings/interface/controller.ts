import Controller from '@ember/controller';
import { alias } from '@ember-decorators/object/computed';
import { service } from '@ember-decorators/service';

import Settings from 'emberclear/services/settings';

export default class InterfaceController extends Controller {
  @service settings!: Settings;

  @alias('settings.hideOfflineContacts') hideOfflineContacts!: boolean;

  @alias('settings.useLeftRightJustificationForMessages')
  useLeftRightJustificationForMessages!: boolean;
}
