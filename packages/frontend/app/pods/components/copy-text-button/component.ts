import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { timeout } from 'ember-concurrency';

// TODO: use {{#if (is-clipboard-supported)}}
//       to not show the clipboard, maybe the URL instead?
export default class CopyTextButton extends Component {
  @tracked copied = false;

  @action async copySuccess() {
    this.copied = true;

    await timeout(2000);

    this.copied = false;
  }
}
