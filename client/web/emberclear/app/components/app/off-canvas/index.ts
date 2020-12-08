import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { debounce } from '@ember/runloop';

import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';

import type CurrentUserService from 'emberclear/services/current-user';
import type Sidebar from 'emberclear/services/sidebar';

type Args = Record<string, unknown>;

export default class OffCanvasContainer extends Component<Args> {
  @service declare currentUser: CurrentUserService;
  @service declare sidebar: Sidebar;

  get mode() {
    if (this.isTabletOrSmaller) {
      return 'reveal';
    }

    return 'squeeze-reveal';
  }

  // ----------------------------------------
  // TODO: extract all this to a resource?
  // ----------------------------------------
  declare handler: any; // where is ember run timer?

  // @service declare window: Window;

  @tracked lastWindowWidth = window.innerWidth;

  // window.screen => physical screen
  // window.innerWidth => full width of window, excluding dev tools
  get isTabletOrSmaller() {
    return this.lastWindowWidth <= TABLET_WIDTH;
  }

  @action
  updateWidth() {
    this.lastWindowWidth = window.innerWidth;
  }

  constructor(owner: unknown, args: Args) {
    super(owner, args);

    this.handler = () => debounce(this, 'updateWidth', 100);

    window.addEventListener('resize', this.handler);
  }

  willDestroy() {
    window.removeEventListener('resize', this.handler);
  }
}
