import { getOwner } from '@ember/application';
import Service from '@ember/service';

import { ensureRequirementsAreMet } from 'pinochle/game/networking/-requirements';
import { GameHost } from 'pinochle/game/networking/host';

export default class GameManager extends Service {
  hosts = new Map<string, GameHost>();

  async createHost() {
    await ensureRequirementsAreMet(getOwner(this));

    let host = await GameHost.build(this);

    this.hosts.set(host.hexId, host);

    return host;
  }

  async connectToHost(hex: string) {}
}
