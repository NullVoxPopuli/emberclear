import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';

import { newDeck, sortHand, splitDeck } from 'pinochle/game/deck';

import type { GameHost } from 'pinochle/game/networking/host';

type Args = {
  id: string;
  hostGame: GameHost;
};

export default class PlayAsHost extends Component<Args> {
  get hand() {
    let deck = newDeck();
    let { hands } = splitDeck(deck, 4);
    let sorted = sortHand(hands[0]);

    return sorted;
  }
}
