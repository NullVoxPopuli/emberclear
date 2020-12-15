import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';

import Modifier from 'ember-modifier';

type Args = {
  positional: [];
  named: { scale: number };
};

export default class FitTextModifier extends Modifier<Args> {
  didInstall() {
    window.addEventListener('resize', this.resizeText);
    this.resizeText();
  }

  willRemove() {
    window.removeEventListener('resize', this.resizeText);
  }

  @action
  resizeText() {
    return debounce(this, '_resizeText', 200);
  }

  @action
  _resizeText() {
    // It seems that if the fontSize is changed to quickly fater a resize
    // even an animationFrame is too soo before the CSS Animations have finished
    // computing
    setTimeout(() => {
      requestAnimationFrame(() => {
        if (this.isDestroyed || this.isDestroying) {
          return;
        }

        assert('expected element to be an HTML Element', this.element instanceof HTMLElement);

        let elementWidth = this.element.clientWidth;
        let compressor = 0.12;

        let fontSize = (elementWidth / (compressor * 10)) * (this.args.named.scale || 1);

        this.element.style.fontSize = `${fontSize}px`;
      });
    }, 10);
  }
}
