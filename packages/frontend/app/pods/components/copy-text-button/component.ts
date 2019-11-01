import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';
import { setComponentTemplate } from '@ember/component';
import { hbs } from 'ember-cli-htmlbars';

// TODO: use {{#if (is-clipboard-supported)}}
//       to not show the clipboard, maybe the URL instead?
class CopyTextButton extends Component {
  @tracked copied = false;

  @action async copySuccess() {
    this.copied = true;

    await timeout(2000);

    this.copied = false;
  }
}

export default setComponentTemplate(
  hbs`
  <CopyButton
    @success={{this.copySuccess}}
    @clipboardText={{@text}}
    class='has-status-tip {{if this.copied 'is-active'}}'
    ...attributes
  >
    {{@label}}

    <HoverTip @animationClasses='floats-up'>
      {{t 'ui.invite.copied'}}
    </HoverTip>
  </CopyButton>
  `,
  CopyTextButton
);
