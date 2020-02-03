import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { NormalizedMeta } from 'emberclear/utils/normalized-meta';

interface IArgs {
  url: string;
  meta: NormalizedMeta;
}

export default class EmbeddedResource extends Component<IArgs> {
  @tracked isCollapsed = false;

  get isOpen() {
    return !this.isCollapsed;
  }

  @action toggleShow() {
    this.isCollapsed = !this.isCollapsed;
  }
}
