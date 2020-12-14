import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';

import { TrackedArray } from 'tracked-built-ins';

import { adjustHand, toggleHand } from 'pinochle/utils/animation/hand';

import type { CardAnimation } from 'pinochle/utils/animation/hand';
import type { Card, Hand } from 'pinochle/utils/deck';

type Args = {
  hand: Hand;
};

const animations = new WeakMap<HTMLElement, CardAnimation>();

export default class HandComponent extends Component<Args> {
  @tracked isActive = false;

  @action
  toggle() {
    this.isActive = !this.isActive;

    let hand = document.querySelector('.player-hand');

    assert(`expected to be an HTML Element`, hand instanceof HTMLElement);

    toggleHand({
      parentElement: hand,
      isOpen: this.isActive,
      animations,
    });
  }

  @action
  adjust() {
    if (!this.isActive) {
      return;
    }

    let hand = document.querySelector('.player-hand');

    assert(`expected to be an HTML Element`, hand instanceof HTMLElement);

    adjustHand({
      parentElement: hand,
      isOpen: this.isActive,
      animations,
    });
  }

  @action
  remove(card: Card, event: MouseEvent) {
    assert(`expected to be an HTML Element`, event.currentTarget instanceof HTMLElement);

    for (let i = 0; i < this.cards.length; i++) {
      if (this.cards[i] === card) {
        this.cards.splice(i, 1);
        animations.delete(event.currentTarget);
        break;
      }
    }
  }

  // @cached
  cards = new TrackedArray<Card>([
    { suit: 'clubs', value: 10 },
    { suit: 'clubs', value: 9 },
    { suit: 'clubs', value: 8 },
    { suit: 'clubs', value: 7 },
    { suit: 'clubs', value: 6 },
    { suit: 'clubs', value: 5 },
    { suit: 'clubs', value: 4 },
    { suit: 'diamonds', value: 3 },
    { suit: 'diamonds', value: 2 },
    { suit: 'diamonds', value: 'ace' },
    { suit: 'diamonds', value: 'jack' },
    { suit: 'hearts', value: 'king' },
    { suit: 'spades', value: 'queen' },
  ]);
}
