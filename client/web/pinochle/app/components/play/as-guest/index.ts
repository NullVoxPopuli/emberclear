import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';

import { newDeck, sortHand, splitDeck } from 'pinochle/game/deck';

import type { GameGuest } from 'pinochle/game/networking/guest';
type Args = {
  id: string;
  hostGame: GameGuest;
};

export default class PlayAsGuest extends Component<Args> {
  get hand() {
    let deck = newDeck();
    let { hands } = splitDeck(deck, 4);
    let sorted = sortHand(hands[0]);

    return sorted;
  }
}
