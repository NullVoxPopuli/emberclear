import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';

import type GameManager from 'pinochle/services/game-manager';
import type PlayerInfo from 'pinochle/services/player-info';

type Args = {
  id: string;
};

export default class PlayerOrder extends Component<Args> {
  @service declare gameManager: GameManager;
  @service declare playerInfo: PlayerInfo;

  get gameInfo() {
    let info = this.gameManager.isGuestOf.get(this.args.id);

    assert(`This component can't be used without a an active game session`, info);

    return info;
  }

  get currentPlayer() {
    return this.gameInfo.gameState.currentPlayer;
  }

  get players() {
    return this.gameInfo.playerOrder;
  }
}
