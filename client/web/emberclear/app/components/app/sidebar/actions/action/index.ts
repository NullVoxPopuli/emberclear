import Component from '@glimmer/component';
import Action from 'emberclear/models/action';

interface IArgs {
  action: Action;
}

export default class ResponsePanel extends Component<IArgs> {
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
