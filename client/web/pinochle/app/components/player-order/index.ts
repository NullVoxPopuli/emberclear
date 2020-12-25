import Component from '@glimmer/component';
import { assert } from '@ember/debug';
import { inject as service } from '@ember/service';
import GameManager from 'pinochle/services/game-manager';

type Args = {
  id: string;
}

export default class PlayerOrder extends Component<Args> {
  @service declare gameManager: GameManager;

  get gameInfo() {
    let info = this.gameManager.isGuestOf.get(this.args.id);

    assert(`This component can't be used without a an active game session`, info);

    return info;
  }

  get players() {
    return this.gameInfo.playersInOrder;
  }
}
