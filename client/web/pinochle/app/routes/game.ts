import { assert } from '@ember/debug';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type GameManager from 'pinochle/services/game-manager';
type Transition = ReturnType<RouterService['transitionTo']>;

interface Params {
  idOfHost: string;
}

export default class GameRoute extends Route {
  @service declare gameManager: GameManager;
  @service declare router: RouterService;

  async beforeModel(transition: Transition) {
    let hostId = transition.to.params.idOfHost;
    let gameInfo = this.gameManager.find(hostId || '');

    if (!gameInfo) {
      this.router.transitionTo('/');
    }
  }

  async model(params: Params) {
    let hostId = params.idOfHost;

    let gameInfo = this.gameManager.find(hostId);

    assert(`This component should not be used without a gameInfo`, gameInfo);

    let isHosting = 'host' in gameInfo;
    let game = isHosting ? gameInfo.host : gameInfo.guest;

    return {
      hostId,
      game,
      isHosting,
    };
  }
}
