import Component from '@glimmer/component';
import { setComponentTemplate } from '@ember/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import hbs from 'ember-cli-htmlbars-inline-precompile';

class Shadowed extends Component {
  @tracked shadow?: ShadowRoot;

  @action setElement(element: HTMLElement) {
    let shadow = element.attachShadow({ mode: 'open' });

    this.shadow = shadow;
  }
}

export default setComponentTemplate(
  hbs`
    <div {{did-insert this.setElement}}></div>

    {{#if this.shadow}}
      {{#-in-element this.shadow}}
        {{yield}}
      {{/-in-element}}
    {{/if}}
`,
  Shadowed
);
