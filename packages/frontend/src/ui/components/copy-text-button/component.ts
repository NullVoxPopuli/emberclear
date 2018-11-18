import Component, { tracked } from 'sparkles-component';

export default class CopyTextButton extends Component {
  @tracked copied = false;

  copySuccess(e: any) {
    e.clearSelection();
    this.copied = true;

    setTimeout(() => this.copied = false, 2000);
  }
}
