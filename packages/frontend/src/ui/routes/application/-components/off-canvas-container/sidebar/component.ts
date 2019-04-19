import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads, alias } from '@ember/object/computed';

import SidebarService from 'emberclear/services/sidebar/service';
import IdentityService from 'emberclear/services/identity/service';
import Modals from 'emberclear/services/modals';

import { scrollIntoViewOfParent } from 'emberclear/src/utils/dom/utils';

export default class Sidebar extends Component {
  @service sidebar!: SidebarService;
  @service identity!: IdentityService;
  @service modals!: Modals;

  @reads('sidebar.isShown') isShown!: boolean;
  @alias('sidebar.hasUnreadAbove') hasUnreadAbove!: boolean;
  @alias('sidebar.hasUnreadBelow') hasUnreadBelow!: boolean;
  @reads('identity.name') name?: string;
  @reads('identity.isLoggedIn') isLoggedIn!: boolean;

  @action closeSidebar() {
    this.sidebar.hide();
  }

  @action scrollDownToNearestUnread() {
    const scrollable = document.querySelector('.sidebar-wrapper aside')!;
    const lastRow = scrollable.querySelector('.tag')!;

    scrollIntoViewOfParent(scrollable, lastRow);
    this.sidebar.clearUnreadBelow();
  }

  @action scrollUpToNearestUnread() {
    const scrollable = document.querySelector('.sidebar-wrapper aside')!;
    const lastRow = scrollable.querySelector('.tag')!;

    scrollIntoViewOfParent(scrollable, lastRow);
    this.sidebar.clearUnreadAbove();
  }
}
