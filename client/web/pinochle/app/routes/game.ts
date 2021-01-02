import { assert } from '@ember/debug';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import type RouterService from '@ember/routing/router-service';
import type GameManager from 'pinochle/services/game-manager';
import type PlayerInfo from 'pinochle/services/player-info';
type Transition = ReturnType<RouterService['transitionTo']>;

interface Params {
  idOfHost: string;
}

/**
 * /game/:id can only be visited by players
 *
 * :id is the public key as hex of the host game
 *
 * NOTE: the person who is hosting the game also has a player
 * identity.
 *
 */
export default class GameRoute extends Route {
  @service declare gameManager: GameManager;
  @service declare playerInfo: PlayerInfo;
  @service declare router: RouterService;

  async beforeModel(transition: Transition) {
    let hostId = transition.to.params.idOfHost;
    let gameGuest = this.gameManager.isGuestOf.get(hostId || '');

    if (hostId === 'undefined') {
      console.debug(transition.to);
      throw new Error(`Undefined hostId`);
    }

    /**
     * TODO: add some global error / toast / flash messages
     */
    if (!gameGuest) {
      this.router.transitionTo(`/join/${hostId}`);
    }
  }

  async model(params: Params) {
    let hostId = params.idOfHost;

    let gameGuest = this.gameManager.isGuestOf.get(hostId || '');

    assert(`This component should not be used without a gameInfo`, gameGuest);

    return {
      hostId,
      game: gameGuest,
    };
  }

  async afterModel() {
    this.gameManager.storeAll();
  }
}
