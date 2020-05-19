import Component from '@glimmer/component';

import { action } from '@ember/object';

import Channel from 'emberclear/models/channel';
import VoteChain from 'emberclear/models/vote-chain';
import Vote from 'emberclear/models/vote';

interface IArgs {
  vote: VoteChain;
}

//TODO: discuss user changing their mind
export default class ResponsePanel extends Component<IArgs> {
  @action
  yes() {
    //TODO: Construct and send a yes vote
  }

  @action
  no() {
    //TODO: Construct and send a no vote
  }

  @action
  dismiss() {
    //TODO: Mark the action as dismissed
  }
}
