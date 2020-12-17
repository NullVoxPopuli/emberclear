import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

import { newDeck, sortHand, splitDeck } from 'pinochle/utils/deck';
import { Meld } from 'pinochle/utils/game/meld';

import { HandAnimation } from './-animation/hand';

import type { Card, Hand } from 'pinochle/utils/deck';

type Args = {
  hand: Hand;
};

export default class HandComponent extends Component<Args> {
  @cached
  get hand() {
    return new HandAnimation(getOwner(this), this.cards);
  }

  /**
   * Given the current cards, what are all the meld combinations and score?
   */
  @cached
  get meld() {
    return new Meld([...(this.cards as Card[])]);
  }

  @action
  toggle() {
    this.hand.toggle();
  }

  @action
  selectCard(card: Card) {
    this.hand.send('SELECT', { card });
  }

  @action
  adjust() {
    this.hand.send('ADJUST');
  }

  @cached
  get cards() {
    let deck = newDeck();
    let dealt = splitDeck(deck, 4);
    let hand = dealt.hands[0];
    let sorted = sortHand(hand);

    return sorted;
  }
}
