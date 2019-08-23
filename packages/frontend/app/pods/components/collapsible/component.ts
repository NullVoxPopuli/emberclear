import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Collapsible extends Component {
  @tracked isOpen = true;
}
