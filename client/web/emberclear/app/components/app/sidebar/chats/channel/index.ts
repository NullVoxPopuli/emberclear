import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

import { TABLET_WIDTH } from 'emberclear/utils/breakpoints';

import RouterService from '@ember/routing/router-service';
import SidebarService from 'emberclear/services/sidebar';
import Channel from 'emberclear/models/channel';

type Args = {
  channel: Channel;
};

export default class SidebarChannel extends Component<Args> {
  @service declare sidebar: SidebarService;
  @service declare router: RouterService;

  @action
  async onClickChannel(channel: Channel) {
    if (window.innerWidth < TABLET_WIDTH) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this.sidebar.hide();
    }

    await this.router.transitionTo('chat.in-channel', channel.id);
  }
}
