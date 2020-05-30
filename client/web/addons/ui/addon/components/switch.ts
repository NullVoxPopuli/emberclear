import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

import { v4 as uuid } from 'uuid';

class Field extends Component {
  id = uuid();
}

export default setComponentTemplate(
  hbs`
  <span class='switch'>
    <input
      ...attributes
      type='checkbox'
      id={{this.id}}
      checked={{@value}}
    >

    <label for={{this.id}}>{{@label}}</label>
  </span>
`,
  Field
);
