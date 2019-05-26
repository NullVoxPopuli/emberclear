import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Footer extends Component {
  @tracked showMoneroAddress = false;
}
