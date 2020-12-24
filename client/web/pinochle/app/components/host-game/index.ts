import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { use } from 'ember-could-get-used-to-this';

import { Statechart } from 'pinochle/utils/use-machine';

import { statechart } from './-statechart';

import type RouterService from '@ember/routing/router-service';
import type { GameHost } from 'pinochle/game/networking/host';
import type GameManager from 'pinochle/services/game-manager';

type Args = {
  numPlayers: number;
};

export default class HostGame extends Component<Args> {
  @service declare router: RouterService;
  @service declare gameManager: GameManager;

  @tracked gameHost?: GameHost;

  @use
  interpreter = new Statechart(() => {
    return {
      named: {
        chart: statechart,
        context: { numPlayers: this.args.numPlayers },
        config: {
          actions: {
            startGame: this._startGame,
            establishConnection: this._establishConnection,
          },
        },
      },
    };
  });

  get state() {
    return this.interpreter.state?.toStrings();
  }

  get connectedPlayers() {
    return this.gameHost?.numConnected || 0;
  }

  get joinUrl() {
    return this.gameHost?.joinUrl;
  }

  /*********************************
   * Machine Actions
   ********************************/

  @action
  _startGame() {
    if (this.gameHost) {
      this.router.transitionTo(`/game/${this.gameHost.hexId}`);

      return;
    }

    this.interpreter.send('START_GAME_FAILED');
  }

  /**
   * Create Identity if it doesn't exist
   * also connect to the relay
   */
  @action
  async _establishConnection() {
    this.gameHost = await this.gameManager.createHost();
  }
}
