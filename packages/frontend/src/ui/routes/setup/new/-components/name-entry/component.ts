import Component from '@ember/component';
import { Registry } from '@ember/service';
import { isBlank } from '@ember/utils';
import { service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';

import IdentityService from 'emberclear/services/identity/service';


// TODO: https://adfinis-sygroup.github.io/ember-validated-form/latest/
// use a form validation library ^
export default class NameEntry extends Component {
  @service identity!: IdentityService;
  @service router!: Registry['router'];

  name!: string;

  @computed('name')
  get nameIsBlank(this: NameEntry): boolean {
    return isBlank(this.name);
  }

  @action
  async createIdentity(this: NameEntry) {
    if (this.nameIsBlank) return;
    const exists = await this.identity.exists();

    if (!exists) {
      await this.identity.create(this.name);
    }

    this.router.transitionTo('setup.completed');
  }
};
