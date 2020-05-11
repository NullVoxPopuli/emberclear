import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { reads, alias } from '@ember/object/computed';

import SidebarService from 'emberclear/services/sidebar';
import CurrentUserService from 'emberclear/services/current-user';

import Modals from 'emberclear/services/modals';

import { scrollIntoViewOfParent } from 'emberclear/utils/dom/utils';

export default class Sidebar extends Component {
  @service sidebar!: SidebarService;
  @service currentUser!: CurrentUserService;
  @service modals!: Modals;

  @reads('sidebar.isShown') isShown!: boolean;
  @alias('sidebar.hasUnreadAbove') hasUnreadAbove!: boolean;
  @alias('sidebar.hasUnreadBelow') hasUnreadBelow!: boolean;
  @reads('currentUser.name') name?: string;
  @reads('currentUser.isLoggedIn') isLoggedIn!: boolean;
  @alias('sidebar.contactsSelected') contactsSelected!: boolean;
  @alias('sidebar.channelsSelected') channelsSelected!: boolean;
  @alias('sidebar.actionsSelected') actionsSelected!: boolean;

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
  switchToContacts() {
    this.contactsSelected = true;
    this.channelsSelected = false;
    this.actionsSelected = false;
  }

  @action
  switchToChannels() {
    this.contactsSelected = false;
    this.channelsSelected = true;
    this.actionsSelected = false;
  }

  @action
  switchToActions() {
    this.contactsSelected = false;
    this.channelsSelected = false;
    this.actionsSelected = true;
  }
}
