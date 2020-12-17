import { cached, tracked } from '@glimmer/tracking';
import { setOwner } from '@ember/application';
import { assert } from '@ember/debug';

import { TrackedArray } from 'tracked-built-ins';

import { adjustHand, selectCard, toggleHand } from './-animation';

import type { CardAnimation } from './-animation';
import type { Card } from 'pinochle/utils/deck';

const animations = new WeakMap<HTMLElement, CardAnimation>();

/**
 * A hand only has a few states on its own, most states are handled be the cards themselves
 * - isActive / fanned out -- useful only for unfanning if an opponent is in the same building / room
 *                            as you and you need to hide your cards
 * - isCurrentTurn         -- when it's the players current turn, the allowed cards to play will be highlighted
 * - isBidding             -- when it's the bidding phase of a game, the meld will be calculated
 *                            for the player and displayed
 *
 */
export class PlayerHand {
  declare cards: TrackedArray<Card>;

  @tracked isActive = false;

  constructor(owner: unknown, cards: Card[]) {
    setOwner(this, owner);

    this.cards = new TrackedArray(cards);
  }

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

  selectCard(_card: Card, event: MouseEvent) {
    assert(`expected to be an HTML Element`, event.currentTarget instanceof HTMLElement);

    selectCard({ cardElement: event.currentTarget, animations });
  }

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
}
