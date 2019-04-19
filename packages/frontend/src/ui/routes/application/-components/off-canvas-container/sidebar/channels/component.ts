import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { TABLET_WIDTH } from 'emberclear/src/utils/breakpoints';

import Channel from 'emberclear/data/models/channel';

export default class Channels extends Component {
  @service router;
  @service store;

  @tracked isFormVisible = false;

  get channels() {
    return this.store.peekAll('channel');
  }

  @action toggleForm() {
    this.isFormVisible = !this.isFormVisible;
  }

  @action onClickChannel(channel: Channel) {
    if (window.innerWidth < TABLET_WIDTH) {
      this.args.closeSidebar();
    }

    this.router.transitionTo('chat.in-channel', channel.id);
  }
}
