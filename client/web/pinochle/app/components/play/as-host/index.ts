import Component from '@glimmer/component';

import { use } from 'ember-could-get-used-to-this';

import { newDeck, sortHand, splitDeck } from 'pinochle/game/deck';
import { Statechart } from 'pinochle/utils/use-machine';

import { statechart } from './-statechart';

import type { GameHost } from 'pinochle/game/networking/host';

type Args = {
  id: string;
  hostGame: GameHost;
};

export default class PlayAsHost extends Component<Args> {
  @use
  interpreter = new Statechart(() => {
    return {
      named: {
        chart: statechart,
        context: {
          // numPlayers: this.args.numPlayers
        },
        config: {
          actions: {
            // startGame: this._startGame,
            // establishConnection: this._establishConnection,
          },
        },
      },
    };
  });

  get state() {
    return this.interpreter.state?.toStrings();
  }
  get hand() {
    let deck = newDeck();
    let { hands } = splitDeck(deck, 4);
    let sorted = sortHand(hands[0]);

    return sorted;
  }
}
