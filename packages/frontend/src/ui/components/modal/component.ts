import Component from '@ember/component';

export default class Modal extends Component {
  keyPress(e: KeyboardEvent) {
    // check for escape
    if (e.charCode === 27) {
      this.send('close');
    }
  }
}
