import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';

import type CurrentUserService from 'emberclear/services/current-user';
import type Sidebar from 'emberclear/services/sidebar';

export default class OffCanvasContainer extends Component {
  @service declare currentUser: CurrentUserService;
  @service declare sidebar: Sidebar;
  // @service declare window: Window;

  @tracked lastWindowWidth = window.innerWidth;

  get mode() {
    if (this.isTabletOrSmaller) {
      return 'reveal';
    }

    return 'squeeze-reveal';
  }

  // window.screen => physical screen
  // window.innerWidth => full width of window, excluding dev tools
  get isTabletOrSmaller() {
    return this.lastWindowWidth <= TABLET_WIDTH;
  }

  @action
  updateWindowWidth() {
    this.lastWindowWidth = window.innerWidth;
  }
}
