import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { scrollIntoViewOfParent } from 'emberclear/utils/dom/utils';

import type CurrentUserService from 'emberclear/services/current-user';
import type Modals from 'emberclear/services/modals';
import type SidebarService from 'emberclear/services/sidebar';

const Tab = {
  Contacts: 'contacts',
  Channels: 'channels',
  Actions: 'actions',
} as const;

type TabKeys = keyof typeof Tab;
type TAB = typeof Tab[TabKeys];

export default class Sidebar extends Component {
  Tab = Tab;

  @service sidebar!: SidebarService;
  @service currentUser!: CurrentUserService;
  @service modals!: Modals;
  @tracked selectedTab: TAB = this.Tab.Contacts;

  get isShown() {
    return this.sidebar.isShown;
  }

  get hasUnreadAbove() {
    return this.sidebar.hasUnreadAbove;
  }

  get hasUnreadBelow() {
    return this.sidebar.hasUnreadBelow;
  }

  get name() {
    return this.currentUser.name;
  }

  get isLoggedIn() {
    return this.currentUser.isLoggedIn;
  }

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
