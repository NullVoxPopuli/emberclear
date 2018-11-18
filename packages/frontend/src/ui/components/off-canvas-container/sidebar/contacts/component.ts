import Component from 'sparkles-component';

import { service } from '@ember-decorators/service';
import { computed }  from '@ember-decorators/object';
import { reads, filterBy } from '@ember-decorators/object/computed';

import Identity, { Status, STATUS } from 'emberclear/src/data/models/identity/model';
import SettingsService from 'emberclear/src/services/settings';

interface IArgs {
  contacts: Identity[];
}

export default class ContactsSidebar extends Component<IArgs> {
  @service settings!: SettingsService;

  @reads('settings.hideOfflineContacts') hideOfflineContacts!: boolean;
  @filterBy('args.contacts', 'onlineStatus', STATUS.OFFLINE) offlineContacts!: Identity[];

  @computed('offlineContacts.@each')
  get numberOffline() {
    return this.offlineContacts.length;
  }

  @computed('hideOfflineContacts', 'args.contacts.@each')
  get contacts() {
    const { contacts } = this.args;

    if (this.hideOfflineContacts) {
      return contacts.filter(contact => {
        return contact.onlineStatus !== Status.OFFLINE;
      });
    }

    return contacts;
  }

}
