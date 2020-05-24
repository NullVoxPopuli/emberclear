import Modifier from 'ember-modifier';
import { inject as service } from '@ember/service';

import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'emberclear/utils/ember-concurrency';
import { timeout } from 'ember-concurrency';

import { selectUnreadDirectMessages } from 'emberclear/models/message/utils';

type Contact = import('emberclear/models/contact').default;
type StoreService = import('@ember-data/store').default;

interface Args {
  positional: [Contact];
  named: EmptyRecord;
}

export default class HasUnread extends Modifier<Args> {
  @service store!: StoreService;

  get contact() {
    return this.args.positional[0];
  }

  didReceiveArguments() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.findUnread).perform();
  }

  @restartableTask
  *findUnread() {
    yield timeout(1000);
    // TODO: are messages always going to be stored in memory?
    //       no, that'd be ridiculous -- we want emberclear to work
    //       on phones, too.
    //
    // potentially long operations are still yielded so that execution can be cancelled
    let allMessages = yield this.store.peekAll('message');

    let unreadMessages = yield selectUnreadDirectMessages(allMessages, this.contact.id);

    this.contact.numUnread = unreadMessages.length;
  }
}
