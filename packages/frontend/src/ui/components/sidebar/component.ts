import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';
import { reads, alias } from '@ember-decorators/object/computed';

import Sidebar from 'emberclear/services/sidebar';
import IdentityService from 'emberclear/services/identity/service';
import Modals from 'emberclear/services/modals';

export default class extends Component {
  @service sidebar!: Sidebar;
  @service identity!: IdentityService;
  @service modals!: Modals;

  @reads('sidebar.isShown') isShown!: boolean;
  @alias('identity.name') name?: string;
  @alias('identity.isLoggedIn') isLoggedIn!: boolean;

  isChannelFormVisible = false;

  @action
  closeSidebar() {
    this.sidebar.hide();
  }

  @action
  toggleModal(name: string) {
    this.modals.toggle(name);
  }

  @action
  toggleChannelForm() {
    this.set('isChannelFormVisible', !this.isChannelFormVisible);
  }
}
