import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads, alias } from '@ember/object/computed';

import SidebarService from 'emberclear/services/sidebar';
import CurrentUserService from 'emberclear/services/current-user';

import Modals from 'emberclear/services/modals';

import { scrollIntoViewOfParent } from 'emberclear/utils/dom/utils';

enum Tab {
  Contacts = 'contacts-tab',
  Channels = 'channels-tab',
  Actions = 'actions-tab',
}

export default class Sidebar extends Component {
  @service sidebar!: SidebarService;
  @service currentUser!: CurrentUserService;
  @service modals!: Modals;

  @reads('sidebar.isShown') isShown!: boolean;
  @alias('sidebar.hasUnreadAbove') hasUnreadAbove!: boolean;
  @alias('sidebar.hasUnreadBelow') hasUnreadBelow!: boolean;
  @reads('currentUser.name') name?: string;
  @reads('currentUser.isLoggedIn') isLoggedIn!: boolean;
  @alias('sidebar.selectedTab') selectedTab!: Tab;

  @action
  scrollDownToNearestUnread() {
    const scrollable = document.querySelector('.sidebar-wrapper aside')!;
    const lastRow = scrollable.querySelector('.tag')!;

    scrollIntoViewOfParent(scrollable, lastRow);
    this.sidebar.clearUnreadBelow();
  }

  @action
  scrollUpToNearestUnread() {
    const scrollable = document.querySelector('.sidebar-wrapper aside')!;
    const lastRow = scrollable.querySelector('.tag')!;

    scrollIntoViewOfParent(scrollable, lastRow);
    this.sidebar.clearUnreadAbove();
  }

  @action
  switchTo(tab: Tab) {
    const activeTab = document.querySelector('.sidebar-tab-selected')! as HTMLElement;
    const selectedTab = document.getElementById(tab) as HTMLElement;
    activeTab.classList.remove('.sidebar-tab-selected');
    selectedTab.classList.add('.sidebar-tab-selected');
  }
}
