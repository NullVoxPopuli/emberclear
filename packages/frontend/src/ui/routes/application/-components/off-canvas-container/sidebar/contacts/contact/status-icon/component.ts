import Component from '@glimmer/component';
import Contact from 'emberclear/src/data/models/contact/model';

interface IArgs {
  contact: Contact;
}

export default class StatusIcon extends Component<IArgs> {
  get color() {
    switch (this.args.contact.onlineStatus) {
      case 'online':
        return 'success';
      case 'offline':
        return 'lighter';
      case 'away':
        return 'warning';
      case 'busy':
        return 'lighter';
      default:
        return 'darker';
    }
  }
}
