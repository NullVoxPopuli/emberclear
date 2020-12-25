import { getOwner } from '@ember/application';
import Service from '@ember/service';

import { ensureRequirementsAreMet } from 'pinochle/game/networking/-requirements';
import { GameGuest } from 'pinochle/game/networking/guest';
import { GameHost } from 'pinochle/game/networking/host';

/**
 * TODO: figure out how to serialize games so that
 *       we can handle accidental refreshes and/or navigations
 *
 */
export default class GameManager extends Service {
  isHosting = new Map<string, GameHost>();

  /**
   * Note, the player that hosts will also be a guest
   */
  isGuestOf = new Map<string, GameGuest>();

  async createHost() {
    await ensureRequirementsAreMet(getOwner(this));

    let host = await GameHost.build(this);

    this.isHosting.set(host.hexId, host);

    return host;
  }

  async connectToHost(hex: string) {
    await ensureRequirementsAreMet(getOwner(this));

    let guest = await GameGuest.build(this, hex);

    this.isGuestOf.set(hex, guest);

    return guest;
  }
}
