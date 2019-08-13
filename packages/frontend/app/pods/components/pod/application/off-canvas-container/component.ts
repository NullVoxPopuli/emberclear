import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';

import CurrentUserService from 'emberclear/services/current-user';

import Sidebar from 'emberclear/services/sidebar/service';

export default class OffCanvasContainer extends Component {
  @service currentUser!: CurrentUserService;
  @service sidebar!: Sidebar;

  @reads('currentUser.isLoggedIn')
  isLoggedIn!: boolean;

  @action
  onInsert(sidebarElement: HTMLElement) {
    this.sidebar.setup(sidebarElement);
  }
}
