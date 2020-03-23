import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

class Collapsible extends Component {
  @tracked isOpen = true;

  @action
  toggle() {
    this.isOpen = !this.isOpen;
  }
}

export default setComponentTemplate(
  hbs`
  {{yield this.isOpen
    this.toggle
    (component 'collapsible/icon')
  }}
`,
  Collapsible
);
