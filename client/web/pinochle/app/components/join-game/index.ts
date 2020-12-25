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
import type GameManager from 'pinochle/services/game-manager';

type Args = {
  hostId: string;
};

export default class JoinGame extends Component<Args> {
  @service declare gameManager: GameManager;
  @service declare router: RouterService;

  @tracked gameHost?: GameGuest;

  @use
  interpreter = new Statechart(() => {
    return {
      named: {
        chart: statechart,
        context: { name: '' },
        config: {
          actions: {
            establishConnection: this._establishConnection,
            joinGame: this._joinGame,
          },
        },
      },
    };
  });

  get state() {
    return this.interpreter.state?.toStrings();
  }

  get isJoining() {
    return this.state?.includes('joining');
  }

  get isWaiting() {
    return this.state?.includes('waiting');
  }

  get isPending() {
    return this.isWaiting || this.isJoining;
  }

  @action
  handleSubmit(name: string) {
    this.interpreter.send('SUBMIT_NAME', { name });
  }

  /*********************************
   * Machine Actions
   ********************************/
  @action
  async _establishConnection() {
    this.gameHost = await this.gameManager.connectToHost(this.args.hostId);

    try {
      await this.gameHost.checkHost();

      this.interpreter.send('CONNECTED');
    } catch {
      this.interpreter.send('ERROR');
    }
  }

  @action
  async _joinGame({ name }: Context) {
    await this.gameHost?.joinHost(name);

    this.interpreter.send('JOINED');

    await this.gameHost?.waitForStart();

    this.interpreter.send('START');
  }

  @action
  startGame() {
    if (this.gameHost?.gameId) {
      this.router.transitionTo(`/game/${this.gameHost?.gameId}`);

      return;
    }

    this.interpreter.send('ERROR');
  }
}
