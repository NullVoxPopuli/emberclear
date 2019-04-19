import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import Identity, { STATUS } from 'emberclear/src/data/models/identity/model';
import SettingsService from 'emberclear/src/services/settings';
import { TABLET_WIDTH } from 'emberclear/src/utils/breakpoints';

interface IArgs {
  contacts: Identity[];
  closeSidebar: () => void;
}

export default class ContactsSidebar extends Component<IArgs> {
  @service settings!: SettingsService;
  @service router;
  @service store;

  get allContacts(): Identity[] {
    return this.store.peekAll('identity');
  }

  get contacts() {
    if (!this.hideOfflineContacts) {
      return this.allContacts;
    }

    return this.allContacts.filter(contact => {
      return contact.onlineStatus !== STATUS.OFFLINE;
    });
  }

  get hideOfflineContacts() {
    return this.settings.hideOfflineContacts;
  }

  get offlineContacts() {
    return this.allContacts.filter(contact => contact.onlineStatus === STATUS.OFFLINE);
  }

  get numberOffline() {
    return this.offlineContacts.length;
  }

  get showOfflineCounter() {
    return this.hideOfflineContacts && this.numberOffline > 0;
  }

  @action onClickAddFriend() {
    if (window.innerWidth < TABLET_WIDTH) {
      this.args.closeSidebar();
    }

    this.router.transitionTo('add-friend');
  }
}
