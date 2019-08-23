import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CopyTextButton extends Component {
  @tracked copied = false;

  @action copySuccess() {
    this.copied = true;

    setTimeout(() => (this.copied = false), 2000);
  }
}
