import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency-decorators';

import CurrentUserService from 'emberclear/services/current-user';

import { perform } from 'emberclear/utils/ember-concurrency';

type Args = {
  next: () => void;
}

export default class NameEntry extends Component<Args> {
  @service currentUser!: CurrentUserService;

  @tracked name!: string;

  get nameIsBlank(): boolean {
    return isBlank(this.name);
  }

  @action
  createIdentity(e: Event) {
    e.preventDefault();

    perform(this.create);
  }

  @dropTask({ withTestWaiter: true  })
  *create() {
    if (this.nameIsBlank) return;

    const exists = yield this.currentUser.exists();

    if (!exists) {
      yield this.currentUser.create(this.name);
    }

    this.args.next();
  }
}
