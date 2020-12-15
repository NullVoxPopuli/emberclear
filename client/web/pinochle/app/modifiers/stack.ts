import { assert } from '@ember/debug';
import { action } from '@ember/object';

import Modifier from 'ember-modifier';

import { getPoints } from 'pinochle/utils/animation/hand';

export default class StackModifier extends Modifier {
  didInstall() {
    requestAnimationFrame(this.stack);
  }

  @action
  stack() {
    let cards = this.element.querySelectorAll('.playing-card');

    let { path } = getPoints(cards.length);

    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];

      assert(`expected to be an html element`, card instanceof HTMLElement);

      card.animate(
        [
          {
            transform: `translate3d(${0 - 0.5 * i}%, ${0 - 0.5 * i}%, 0)`,
            transformOrigin: `50% ${path.y}px`,
          },
        ],
        {
          duration: 250,
          iterations: 1,
          fill: 'both',
        }
      );
    }
  }
}
