import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface IArgs {
  url: string;
  openGraph: OpenGraphData;
}

export default class EmbeddedResource extends Component<IArgs> {
  @tracked isCollapsed = false;

  get hasExtension() {
    return /\.[\w]{2,4}$/.test(this.args.url);
  }

  @action toggleShow() {
    this.isCollapsed = !this.isCollapsed;
  }
}
