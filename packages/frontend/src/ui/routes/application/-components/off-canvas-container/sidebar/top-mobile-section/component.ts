import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads, alias } from '@ember/object/computed';

import Sidebar from 'emberclear/services/sidebar';
import IdentityService from 'emberclear/services/identity/service';

export default class extends Component {
  @service sidebar!: Sidebar;
  @service identity!: IdentityService;

  @reads('sidebar.isShown') isShown!: boolean;
  @alias('identity.name') name?: string;
  @alias('identity.isLoggedIn') isLoggedIn!: boolean;

  @action
  closeSidebar() {
    this.sidebar.hide();
  }
}
