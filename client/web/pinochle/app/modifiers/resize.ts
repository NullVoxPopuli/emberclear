import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

import Modifier from 'ember-modifier';

type Args = {
  positional: [() => unknown];
  named: Record<string, unknown>;
};

export default class ResizeModifier extends Modifier<Args> {
  didInstall() {
    window.addEventListener('resize', this.callback);
  }

  willRemove() {
    window.removeEventListener('resize', this.callback);
  }

  @action
  callback() {
    return debounce(this, '_callback', 100);
  }

  @action
  _callback() {
    return this.args.positional[0]();
  }
}
