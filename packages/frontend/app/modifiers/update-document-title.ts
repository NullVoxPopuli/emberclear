import Modifier from 'ember-class-based-modifier';
import { inject as service } from '@ember/service';
import CurrentUserService from 'emberclear/services/current-user';

export default class UpdateDocumentTitle extends Modifier {
  @service currentUser!: CurrentUserService;
  originalDocumentTitle: string;

  constructor(owner: any, args: any) {
    super(owner, args);
    this.originalDocumentTitle = document.title;
  }

  willDestroy() {
    document.title = this.originalDocumentTitle;
  }

  didReceiveArguments() {
    let tokens = this.args.positional.join(' | ');
    document.title = `${tokens} | emberclear`;
    if (this.currentUser!.name != null) {
      document.title += ` | ${this.currentUser.name}`;
    }
  }
}
