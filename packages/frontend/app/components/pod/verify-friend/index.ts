import Component from '@glimmer/component';

import Contact from 'emberclear/models/contact';

interface IArgs {
  to: Contact;
}

export default class VerifyFriend extends Component<IArgs> {}