import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { getOwner } from '@ember/application';
import { action } from '@ember/object';

import { Meld } from 'pinochle/game/meld';

import { HandAnimation } from './-animation/hand';

import type { Card } from 'pinochle/game/card';

type Args = {
  cards: Card[];
  onSelect: (card: Card) => void;
};

export default class HandComponent extends Component<Args> {
  @cached
  get hand() {
    return new HandAnimation(getOwner(this), this.args.cards);
  }

  /**
   * Given the current cards, what are all the meld combinations and score?
   */
  @cached
  get meld() {
    return new Meld([...(this.args.cards as Card[])]);
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
}
