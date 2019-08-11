import Component from '@glimmer/component';
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

export default Ember._setComponentTemplate(
  hbs`
    <div {{did-insert this.setElement}}></div>

    {{#if this.shadow}}
      {{#-in-element this.shadow}}
        <style>@import "/assets/emberclear-new.css"</style>
        {{yield}}
      {{/-in-element}}
    {{/if}}
`,
  Shadowed
);
