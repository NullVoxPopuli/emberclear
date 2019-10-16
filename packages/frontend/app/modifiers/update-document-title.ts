import Modifier from 'ember-class-based-modifier';

export default class UpdateDocumentTitle extends Modifier {
  originalDocumentTitle: string;

  constructor(owner, args) {
    super(owner, args);
    this.originalDocumentTitle = document.title;
  }

  get unreadMessageCount(): number {
    return <number>this.args.named.unreadMessageCount;
  }

  get currentUserName(): string {
    return <string>this.args.named.currentUserName;
  }

  willDestroy() {
    document.title = this.originalDocumentTitle;
  }

  didReceiveArguments() {
    document.title = 'emberclear ' + this.unreadMessageCount + ' ' + this.currentUserName;
  }
}
