import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency-decorators';

import type CurrentUserService from 'emberclear/services/current-user';

import { taskFor } from 'ember-concurrency-ts';

type Args = {
  next: () => void;
};

export default class NameEntry extends Component<Args> {
  @service declare currentUser: CurrentUserService;

  @tracked name!: string;

  get nameIsBlank(): boolean {
    return isBlank(this.name);
  }

  @action
  createIdentity(e: Event) {
    e.preventDefault();

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    taskFor(this.create).perform();
  }

  @dropTask({ withTestWaiter: true })
  async create() {
    if (this.nameIsBlank) return;

    const exists = await this.currentUser.exists();

    if (!exists) {
      await this.currentUser.create(this.name);
    }

    this.args.next();
  }
}
