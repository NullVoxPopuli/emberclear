import Component from '@glimmer/component';

export default class StatusIcon extends Component {
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
