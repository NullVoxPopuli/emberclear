import Component from '@glimmer/component';

import { action } from '@ember/object';

import Channel from 'emberclear/models/channel';

interface IArgs {
  channel: Channel;
}

export default class ResponsePanel extends Component<IArgs> {
  @action
  yes() {
    alert('voting yes!');
  }

  @action
  no() {
    alert('voting no!');
  }

  @action
  dismiss() {
    alert('goodbye!');
  }
}
