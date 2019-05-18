import Component from 'sparkles-component';
import { tracked } from '@glimmer/tracking';

export default class CopyTextButton extends Component {
  @tracked copied = false;

  copySuccess(e: any) {
    e.clearSelection();
    this.copied = true;

    setTimeout(() => (this.copied = false), 2000);
  }
}
