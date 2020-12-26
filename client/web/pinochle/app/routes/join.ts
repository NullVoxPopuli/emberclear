import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type GameManager from 'pinochle/services/game-manager';
import type PlayerInfo from 'pinochle/services/player-info';

interface Params {
  idOfHost: string;
}

export default class JoinRoute extends Route {
  @service declare gameManager: GameManager;
  @service declare playerInfo: PlayerInfo;

  async beforeModel() {
    await this.gameManager.loadHosts();
  }

  async model(params: Params) {
    let { idOfHost } = params;

    let skipName = this.playerInfo.lastGameTried === idOfHost;

    return {
      hostId: params.idOfHost,
      skipName,
    };
  }
}
