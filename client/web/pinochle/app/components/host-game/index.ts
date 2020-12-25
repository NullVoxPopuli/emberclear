import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import { use } from 'ember-could-get-used-to-this';

import { Statechart } from 'pinochle/utils/use-machine';

import { statechart } from './-statechart';

import type { Context } from './-statechart';
import type RouterService from '@ember/routing/router-service';
import type { GameGuest } from 'pinochle/game/networking/guest';
import type { GameHost } from 'pinochle/game/networking/host';
import type GameManager from 'pinochle/services/game-manager';

type Args = {
  numPlayers: number;
};

export default class HostGame extends Component<Args> {
  @service declare router: RouterService;
  @service declare gameManager: GameManager;

  @tracked gameHost?: GameHost;
  @tracked gameGuest?: GameGuest;

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

  get context() {
    return this.interpreter.state?.context;
  }

  get connectedPlayers() {
    return this.gameHost?.numConnected || 0;
  }

  get joinUrl() {
    return this.gameHost?.joinUrl;
  }

  get canStartGame() {
    return this.connectedPlayers >= 3;
  }

  get numRemaining() {
    return 3 - this.connectedPlayers;
  }

  @action
  handleSubmit(name: string) {
    this.interpreter.send({ type: 'SUBMIT_NAME', name });
  }

  @action
  start() {
    this.interpreter.send({ type: 'START_GAME' });
  }

  /*********************************
   * Machine Actions
   ********************************/

  @action
  _startGame() {
    if (this.gameHost) {
      this.router.transitionTo(`/game/${this.gameHost.hexId}`);
      this.gameHost.startGame();

      return;
    }

    this.interpreter.send('START_GAME_FAILED');
  }

  /**
   * Create Identity if it doesn't exist
   * also connect to the relay
   */
  @action
  async _establishConnection({ name }: Context) {
    this.gameHost = await this.gameManager.createHost();

    // TODO: error handling?
    this.gameGuest = await this.gameManager.connectToHost(this.gameHost.hexId);
    await this.gameGuest.checkHost();
    await this.gameGuest.joinHost(name);
  }
}
