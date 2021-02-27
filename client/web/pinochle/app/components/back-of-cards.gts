import Component from '@glimmer/component';
import Ellipsis from './loader/ellipsis';

import type { GuestPlayer } from 'pinochle/game/networking/types';

type Args = {
  info: GuestPlayer;
};

export default class BackOfCards extends Component<Args> {
  get isOffline() {
    let { id, isOnline } = this.args.info;

    return id && !isOnline;
  }

  <template>
    <div
      class='other-player'
      ...attributes
    >
      {{#if this.isOffline}}
        <span class='player-offline-indicator'>
          <Ellipsis />
          <span>Waiting...</span>
        </span>
      {{/if}}

      <div class='display {{if this.isOffline 'player-offline'}}'>
        <ul class='back-of-hand playing-hand'>
          <li class='non-player-card card1'>
            <button type='button' disable></button>
          </li>
          <li class='non-player-card card2'>
            <button type='button' disable></button>
          </li>
          <li class='non-player-card card3'>
            <button type='button' disable></button>
          </li>
        </ul>

        <span class='hand-name'>
          {{@info.name}}
        </span>
      </div>
    </div>
  </template>
}
