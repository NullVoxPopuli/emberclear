import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads, alias } from '@ember/object/computed';

import Sidebar from 'emberclear/services/sidebar/service';
import CurrentUserService from 'emberclear/services/current-user';

export default class extends Component {
  @service sidebar!: Sidebar;
  @service currentUser!: CurrentUserService;

  @reads('sidebar.isShown') isShown!: boolean;
  @alias('currentUser.name') name?: string;
  @alias('currentUser.isLoggedIn') isLoggedIn!: boolean;

  @action
  closeSidebar() {
    this.sidebar.hide();
  }
}
