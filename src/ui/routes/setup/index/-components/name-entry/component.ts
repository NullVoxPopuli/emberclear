import Component from '@ember/component';
import { isBlank } from '@ember/utils';
import { service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';

import IdentityService from 'emberclear/services/identity';
import Router from 'emberclear/router';

// TODO: https://adfinis-sygroup.github.io/ember-validated-form/latest/
// use a form validation library ^
export default class NameEntry extends Component {
  @service('identity') identity!: IdentityService;
  @service router!: Router;

  name!: string;

  @computed('name')
  get nameIsBlank(this: NameEntry): boolean {
    return isBlank(this.name);
  }

  @action
  async createIdentity(this: NameEntry) {
    if (this.nameIsBlank) return;

    await this.identity.create(this.name);

    this.router.transitionTo('setup.completed');
  }
};
