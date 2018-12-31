import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';

@tagName('')
export default class Channels extends Component {
  isFormVisible = false;

  @action
  toggleForm() {
    this.set('isFormVisible', !this.isFormVisible);
  }
}
