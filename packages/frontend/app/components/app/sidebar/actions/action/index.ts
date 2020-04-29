import StoreService from '@ember-data/store';
import Component from '@glimmer/component';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { selectUnreadDirectMessages } from 'emberclear/models/message/utils';
import SettingsService from 'emberclear/services/settings';
import SidebarService from 'emberclear/services/sidebar';
import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';
import RouterService from '@ember/routing/router-service';
import Action from 'emberclear/models/action';
import { currentUserId } from 'emberclear/services/current-user';

interface IArgs {
  action: Action;
}


export default class SidebarAction extends Component<IArgs> {
  // TODO
}
