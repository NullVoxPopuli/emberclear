import StoreService from '@ember-data/store';
import Component from '@glimmer/component';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import SettingsService from 'emberclear/services/settings';
import SidebarService from 'emberclear/services/sidebar';
import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';
import RouterService from '@ember/routing/router-service';
import Channel from 'emberclear/models/channel';
import { currentUserId } from 'emberclear/services/current-user';

interface IArgs {
  channel: Channel;
}

export default class ResponsePanel extends Component<IArgs> {

  @action
  yes() {
    alert("voting yes!");
  }

  @action
  no() {
    alert("voting no!");
  }

  @action
  dismiss() {
    alert("goodbye!");
  }
}
