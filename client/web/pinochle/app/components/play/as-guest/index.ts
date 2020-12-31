import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';

import { use } from 'ember-could-get-used-to-this';

import { sortHand } from 'pinochle/game/deck';
import { Statechart } from 'pinochle/utils/use-machine';

import { statechart } from './-statechart';

import type { Card } from 'pinochle/game/card';
import type { GameGuest } from 'pinochle/game/networking/guest';
type Args = {
  id: string;
  game: GameGuest;
};

export default class PlayAsGuest extends Component<Args> {
  @cached
  get hand() {
    return sortHand(this.args.game.gameState.hand);
  }

  get hasHand() {
    return (this.hand?.length || 0) > 0;
  }

  @use
  interpreter = new Statechart(() => {
    return {
      named: {
        chart: statechart,
        context: {},
        config: {
          actions: {},
        },
      },
    };
  });

  @action
  chooseCard(card: Card) {
    this.args.game.playCard(card);
  }

  /****************************
   * Machine Actions
   ***************************/
  @action
  getHand() {
    // return sortHand(this.hostGame);
  }
}
