import Component from '@glimmer/component';
import Helper, { invokeHelper } from '@ember/component/helper';
import { action } from '@ember/object';

import { inLocalStorage } from 'ember-tracked-local-storage';

export default class Options extends Component {
  @inLocalStorage isSynthwave = false;

  @action
  toggle() {
    this.isSynthwave = !this.isSynthwave;
  }

  applyBodyClass = invokeHelper(this, ApplyBodyClass, () => [this.isSynthwave]);
}

type PositionalArgs = [string];

class ApplyBodyClass extends Helper {
  declare className: string;
  compute([className]: PositionalArgs) {
    this.className = className;

    document.body.classList.add(className);
  }

  willDestroy() {
    if (this.className) {
      document.body.classList.remove(this.className);
    }
  }
}
