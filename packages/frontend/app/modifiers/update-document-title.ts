import Modifier from 'ember-class-based-modifier';
import { inject as service } from '@ember/service';
import CurrentUserService from 'emberclear/services/current-user';

export default class UpdateDocumentTitle extends Modifier {
  @service currentUser!: CurrentUserService;
  originalDocumentTitle: string;

  constructor(owner, args) {
    super(owner, args);
    this.originalDocumentTitle = document.title;
  }

  get unreadMessageCount(): number {
    return <number>this.args.named.unreadMessageCount;
  }

  willDestroy() {
    document.title = this.originalDocumentTitle;
  }

  didReceiveArguments() {
    document.title = '${this.unreadMessageCount} - emberclear - ${this.currentUser.name}';
  }
}
