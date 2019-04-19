import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads } from '@ember/object/computed';

import IdentityService from 'emberclear/services/identity/service';
import Sidebar from 'emberclear/services/sidebar';

export default class OffCanvasContainer extends Component {
  @service identity!: IdentityService;
  @service sidebar!: Sidebar;

  @reads('identity.isLoggedIn')
  isLoggedIn!: boolean;

  @action
  toggleSidebar(this: OffCanvasContainer) {
    this.sidebar.toggle();
  }
}
