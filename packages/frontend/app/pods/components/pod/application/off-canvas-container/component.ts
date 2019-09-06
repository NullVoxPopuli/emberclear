import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import CurrentUserService from 'emberclear/services/current-user';

import Sidebar from 'emberclear/services/sidebar';

export default class OffCanvasContainer extends Component {
  @service currentUser!: CurrentUserService;
  @service sidebar!: Sidebar;

  @action
  onInsert(sidebarElement: HTMLElement) {
    this.sidebar.setup(sidebarElement);
  }
}
