import Component from '@ember/component';
import { Registry } from '@ember/service';
import { isBlank } from '@ember/utils';
import { service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';
import { dropTask } from 'ember-concurrency-decorators';

import IdentityService from 'emberclear/services/identity/service';

// TODO: https://adfinis-sygroup.github.io/ember-validated-form/latest/
// use a form validation library ^
export default class NameEntry extends Component {
  @service identity!: IdentityService;
  @service router!: Registry['router'];

  // @tracked
  name!: string;

  @computed('name')
  get nameIsBlank(): boolean {
    return isBlank(this.name);
  }

  @action
  createIdentity(e: Event) {
    this.create.perform();
  }

  @dropTask
  *create(this: NameEntry) {
    if (this.nameIsBlank) return;
    const exists = yield this.identity.exists();

    if (!exists) {
      yield this.identity.create(this.name);
    }

    this.router.transitionTo('setup.completed');
  }
}
