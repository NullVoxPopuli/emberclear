import Component from 'sparkles-component';
import { Registry } from '@ember/service';
import { service } from '@ember-decorators/service';
import { computed } from '@ember-decorators/object';

import Identity from 'emberclear/src/data/models/identity/model';

interface IArgs {
  contact: Identity;
}

export default class SidebarContact extends Component<IArgs> {
  @service router!: Registry['router'];

  @computed('router.currentURL')
  get isActive() {
    const { contact } = this.args;

    return this.router.currentURL.includes(contact.id);
  }
}
