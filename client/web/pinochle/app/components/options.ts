import Component from '@glimmer/component';
import { action } from '@ember/object';

import { inLocalStorage } from 'ember-tracked-local-storage';

export default class Options extends Component {
  @inLocalStorage isSynthwave = false;

  @action
  toggle() {
    this.isSynthwave = !this.isSynthwave;
  }
}
