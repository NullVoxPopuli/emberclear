import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

import { PlayerHand } from './-player-hand';

import type { Card, Hand } from 'pinochle/utils/deck';

type Args = {
  hand: Hand;
};

export default class HandComponent extends Component<Args> {
  @cached
  get handAnimations() {
    return new PlayerHand(getOwner(this), this.cards);
  }

  @action
  toggle() {
    this.handAnimations.toggle();
  }

  @action
  selectCard(card: Card, event: MouseEvent) {
    this.handAnimations.selectCard(card, event);
  }

  @action
  adjust() {
    this.handAnimations.adjust();
  }

  @action
  remove(card: Card, event: MouseEvent) {
    this.handAnimations.remove(card, event);
  }

  // @cached
  cards = [
    { suit: 'clubs', value: 6 },
    { suit: 'clubs', value: 5 },
    { suit: 'clubs', value: 4 },
    { suit: 'diamonds', value: 3 },
    { suit: 'diamonds', value: 2 },
    { suit: 'diamonds', value: 'ace' },
    { suit: 'diamonds', value: 'jack' },
    { suit: 'hearts', value: 'king' },
    { suit: 'spades', value: 'queen' },
    { suit: 'clubs', value: 10 },
    { suit: 'clubs', value: 9 },
    { suit: 'clubs', value: 8 },
    { suit: 'clubs', value: 7 },
  ] as Card[];
}
