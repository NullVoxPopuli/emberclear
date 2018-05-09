import Component from '@ember/component';
import { isBlank } from '@ember/utils';
import { Registry as ServiceRegistry } from '@ember/service';
import { service } from '@ember-decorators/service';
import { computed, action } from '@ember-decorators/object';


// TODO: https://adfinis-sygroup.github.io/ember-validated-form/latest/
// use a form validation library ^
export default class NameEntry extends Component {
  @service identity!: ServiceRegistry['identity'];
  @service router!: ServiceRegistry['router']

  name!: string;

  @computed('name')
  get nameIsBlank(this: NameEntry): boolean {
    return isBlank(this.name);
  }

  @action
  async createIdentity(this: NameEntry) {
    if (this.nameIsBlank) return;
    if (!this.identity.exists()) {
      await this.identity.create(this.name);
    }

    this.router.transitionTo('setup.completed');
  }
};
