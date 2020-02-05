import Component from '@glimmer/component';

import Contact from 'emberclear/models/contact';

interface IArgs {
  contact: Contact;
}

export default class VerifyFriend extends Component<IArgs> {}
