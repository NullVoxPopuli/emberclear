import Component from '@glimmer/component';

import type { GuestPlayer } from 'pinochle/game/networking/types';

type Args = {
  info: GuestPlayer;
};

export default class BackOfCards extends Component<Args> {
  get isOffline() {
    let { id, isOnline } = this.args.info;

    return id && !isOnline;
  }
}
