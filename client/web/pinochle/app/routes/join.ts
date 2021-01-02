import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type GameManager from 'pinochle/services/game-manager';
import type PlayerInfo from 'pinochle/services/player-info';

type Transition = ReturnType<RouterService['transitionTo']>;

interface Params {
  idOfHost: string;
}

export default class JoinRoute extends Route {
  @service declare gameManager: GameManager;
  @service declare playerInfo: PlayerInfo;

  async beforeModel(transition: Transition) {
    let hostId = transition.to.params.idOfHost;

    if (hostId === 'undefined') {
      console.debug(transition.to);
      throw new Error(`Undefined hostId`);
    }

    if (hostId) {
      try {
        await this.gameManager.loadHost(hostId);
      } catch (e) {
        console.error(e);
      }
    }
  }

  async model(params: Params) {
    let { idOfHost } = params;

    let skipName = Boolean(localStorage.getItem(`guest-${idOfHost}`));

    return {
      hostId: params.idOfHost,
      skipName,
    };
  }
}
