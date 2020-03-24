import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Settings, { THEMES } from 'emberclear/services/settings';

export default class InterfaceSettings extends Component {
  @service settings!: Settings;

  @action
  useDarkTheme(e: any) {
    if (e.target.checked) {
      this.settings.selectTheme(THEMES.midnight);
    } else {
      this.settings.selectTheme(THEMES.default);
    }
  }

  @action
  toggleHideOffline() {
    this.settings.hideOfflineContacts = !this.settings.hideOfflineContacts;
  }
}
