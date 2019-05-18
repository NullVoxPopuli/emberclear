import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';

import CurrentUserService from 'emberclear/services/current-user/service';

import Sidebar from 'emberclear/services/sidebar/service';

export default class OffCanvasContainer extends Component {
  @service currentUser!: CurrentUserService;
  @service sidebar!: Sidebar;

  @reads('currentUser.isLoggedIn')
  isLoggedIn!: boolean;

  @action
  toggleSidebar(this: OffCanvasContainer) {
    this.sidebar.toggle();
  }
}
