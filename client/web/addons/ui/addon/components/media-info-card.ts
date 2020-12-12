import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { setComponentTemplate } from '@ember/component';
import { action } from '@ember/object';
import { hbs } from 'ember-cli-htmlbars';

class MediaInfoCard extends Component {
  @tracked isCollapsed = false;

  get isOpen() {
    return !this.isCollapsed;
  }

  @action
  toggleShow() {
    this.isCollapsed = !this.isCollapsed;
  }
}

export default setComponentTemplate(
  hbs`
  <div class='grid:column justify:start'>
    <button
      type='button'
      class='button:as-link w:2x h:2x'
      {{on 'click' this.toggleShow}}
    >
      <FaIcon @icon='angle-down' class='animated {{if this.isCollapsed "rotate:180"}}'/>
    </button>

    <section class='align-self:center'>
      <header class='card-header line-height:2x'>
        {{yield to='header'}}
      </header>

      {{#if this.isOpen}}
        {{yield to='content'}}
      {{/if}}
    </section>
  </div>
  `,
  MediaInfoCard
);
