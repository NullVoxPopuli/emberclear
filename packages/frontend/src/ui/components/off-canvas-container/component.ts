import Component from '@ember/component';
import { service } from '@ember-decorators/service';
import { action } from '@ember-decorators/object';

import IdentityService from 'emberclear/services/identity/service';
import Sidebar from 'emberclear/services/sidebar';

export default class OffCanvasContainer extends Component {
  @service identity!: IdentityService;
  @service sidebar!: Sidebar;

  isLoggedIn = true;


  @action
  toggleSidebar(this: ApplicationController) {
    this.sidebar.toggle();
  }
}
