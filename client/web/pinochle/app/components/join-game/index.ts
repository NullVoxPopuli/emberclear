import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { use } from 'ember-could-get-used-to-this';

import { Statechart } from 'pinochle/utils/use-machine';

import { statechart } from './-statechart';

import type RouterService from '@ember/routing/router-service';

type Args = {
  numPlayers: number;
};

export default class JoinGame extends Component<Args> {
  @service declare router: RouterService;

  @use
  interpreter = new Statechart(() => {
    return {
      named: {
        chart: statechart,
      },
    };
  });

  @action
  _startGame() {
    let id = 1;

    this.router.transitionTo(`/game/${id}`);
  }

  /**
   * Create Identity if it doesn't exist
   * also connect to the relay
   */
  @action
  _establishConnection() {
    // TODO
  }
}
