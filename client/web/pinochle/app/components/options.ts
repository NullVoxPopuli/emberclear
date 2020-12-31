import Component from '@glimmer/component';
import { DEBUG } from '@glimmer/env';
import { action } from '@ember/object';

import { inLocalStorage } from 'ember-tracked-local-storage';

export default class Options extends Component {
  DEBUG = DEBUG;

  @inLocalStorage isSynthwave = false;

  @action
  toggle() {
    this.isSynthwave = !this.isSynthwave;
  }

  get poorMansEffect() {
    if (this.isSynthwave) {
      document.body.classList.add('synthwave');

      return;
    }

    document.body.classList.remove('synthwave');

    return;
  }

  willDestroy() {
    document.body.classList.remove('synthwave');
    super.willDestroy();
  }
}
