import { action } from '@ember/object';

import Modifier from 'ember-modifier';

export default class FitTextModifier extends Modifier {
  didInstall() {
    window.addEventListener('resize', this.resizeText);
    this.resizeText();
  }

  willRemove() {
    window.removeEventListener('resize', this.resizeText);
  }

  @action
  resizeText() {
    let elementWidth = this.element.clientWidth;
    let compressor = 0.15;

    let fontSize = elementWidth / (compressor * 10);

    this.element.style.fontSize = `${fontSize}px`;
  }
}
