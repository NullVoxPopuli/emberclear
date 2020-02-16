import StoreService from '@ember-data/store';
import Component from '@glimmer/component';

import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

import ContactManager from 'emberclear/services/contact-manager';
import CurrentUserService from 'emberclear/services/current-user';
import Contact from 'emberclear/models/contact';

interface IArgs {
  contact: Contact;
}

export default class VerifyFriend extends Component<IArgs> {
  @service currentUser!: CurrentUserService;
  @service store!: StoreService;
  @service contactManager!: ContactManager;
  
  @reads('currentUser.isLoggedIn') isLoggedIn!: boolean;

  get publicIdentity() {
    if (!this.isLoggedIn) return {};

    const { name, uid } = this.currentUser;

    return { name, publicKey: uid };
  }

  get doSomething() {
    console.log('pub ID: ', this.publicIdentity);
    return 1;
  }
}
