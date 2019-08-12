import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';

import CurrentUserService from 'emberclear/services/current-user';

import RouterService from '@ember/routing/router-service';
import Task from 'ember-concurrency/task';

// TODO: https://adfinis-sygroup.github.io/ember-validated-form/latest/
// use a form validation library ^
export default class NameEntry extends Component {
  @service currentUser!: CurrentUserService;
  @service router!: RouterService;

  @tracked name!: string;

  get nameIsBlank(): boolean {
    return isBlank(this.name);
  }

  @action
  createIdentity(e) {
    e.preventDefault();

    this.create.perform();
  }

  @(task(function*(this: NameEntry) {
    if (this.nameIsBlank) return;
    const exists = yield this.currentUser.exists();

    if (!exists) {
      yield this.currentUser.create(this.name);
    }

    this.router.transitionTo('setup.completed');
  }).drop())
  create!: Task;
}
