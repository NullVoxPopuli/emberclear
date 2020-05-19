import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads, alias } from '@ember/object/computed';

import SidebarService from 'emberclear/services/sidebar';
import CurrentUserService from 'emberclear/services/current-user';

import Modals from 'emberclear/services/modals';

import { scrollIntoViewOfParent } from 'emberclear/utils/dom/utils';
import { tracked } from '@glimmer/tracking';

const Tab = {
  Contacts: 'contacts',
  Channels: 'channels',
  Actions: 'actions',
} as const;

type TabKeys = keyof typeof Tab;
type TAB = typeof Tab[TabKeys];

export default class Sidebar extends Component {
  @service sidebar!: SidebarService;
  @service currentUser!: CurrentUserService;
  @service modals!: Modals;
  Tab = Tab;

  @reads('sidebar.isShown') isShown!: boolean;
  @alias('sidebar.hasUnreadAbove') hasUnreadAbove!: boolean;
  @alias('sidebar.hasUnreadBelow') hasUnreadBelow!: boolean;
  @reads('currentUser.name') name?: string;
  @reads('currentUser.isLoggedIn') isLoggedIn!: boolean;
  @tracked selectedTab: TAB = this.Tab.Contacts;

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
  switchToTab(tab: TAB) {
    this.selectedTab = tab;
  }

  get isTabContacts(): boolean {
    return this.selectedTab === this.Tab.Contacts;
  }

  get isTabChannels(): boolean {
    return this.selectedTab === this.Tab.Channels;
  }

  get isTabActions(): boolean {
    return this.selectedTab === this.Tab.Actions;
  }
}
