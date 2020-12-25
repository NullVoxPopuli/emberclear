import { getOwner } from '@ember/application';
import Service from '@ember/service';

import { ensureRequirementsAreMet } from 'pinochle/game/networking/-requirements';
import { GameGuest } from 'pinochle/game/networking/guest';
import { GameHost } from 'pinochle/game/networking/host';

export default class GameManager extends Service {
  isHosting = new Map<string, GameHost>();
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

  find(id: string) {
    let host = this.isHosting.get(id);
    let guest = this.isGuestOf.get(id);

    if (guest) {
      return { guest, id };
    }

    if (host) {
      return { host, id };
    }

    return;
  }
}
