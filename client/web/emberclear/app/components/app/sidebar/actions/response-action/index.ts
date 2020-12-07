import Component from '@glimmer/component';
import type Action from 'emberclear/models/action';

interface IArgs {
  action: Action;
}

export default class ResponseAction extends Component<IArgs> {
  get header() {
    return (
      this.args.action.vote.voteChain.action +
      ' ' +
      this.args.action.vote.voteChain.target.displayName +
      ': ' +
      this.args.action.response
    );
  }
}
