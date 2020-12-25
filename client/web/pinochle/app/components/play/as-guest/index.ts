import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { use } from 'ember-could-get-used-to-this';

import { sortHand } from 'pinochle/game/deck';
import { Statechart } from 'pinochle/utils/use-machine';

import { statechart } from './-statechart';

import type { GameGuest } from 'pinochle/game/networking/guest';
type Args = {
  id: string;
  hostGame: GameGuest;
};

export default class PlayAsGuest extends Component<Args> {
  @cached
  get hand() {
    return sortHand(this.args.hostGame.hand);
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

  /****************************
   * Machine Actions
   ***************************/
  @action
  getHand() {
    // return sortHand(this.hostGame);
  }
}
