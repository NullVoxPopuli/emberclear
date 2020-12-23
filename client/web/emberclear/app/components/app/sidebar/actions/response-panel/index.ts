import Component from '@glimmer/component';
import { action } from '@ember/object';

import type VoteChain from '@emberclear/local-account/models/vote-chain';

interface IArgs {
  vote: VoteChain;
}

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
