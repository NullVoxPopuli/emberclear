import { getOwner } from '@ember/application';
import Service from '@ember/service';

import { timeout } from 'ember-concurrency';

import { ensureRequirementsAreMet } from 'pinochle/game/networking/-requirements';
import { GameRound } from 'pinochle/game/networking/game-round';
import { GameGuest } from 'pinochle/game/networking/guest';
import { GameHost } from 'pinochle/game/networking/host';

import { fromHex } from '@emberclear/encoding/string';

import type { KeyPair } from '@emberclear/crypto';
import type { SerializedGuest } from 'pinochle/game/networking/guest';
import type { SerializedHost } from 'pinochle/game/networking/host';

export default class GameManager extends Service {
  /**
   * Note, the player that hosts will also be a guest
   */
  isGuestOf = new Map<string, GameGuest>();
  isHosting = new Map<string, GameHost>();

  async createHost(keys?: KeyPair) {
    await ensureRequirementsAreMet(getOwner(this));

    let host = await GameHost.build(this);

    if (keys) {
      host.setCrypto(keys);
    }

    this.isHosting.set(host.hexId, host);

    return host;
  }

  async connectToHost(hex: string, keys?: KeyPair) {
    await ensureRequirementsAreMet(getOwner(this));

    let guest = await GameGuest.build(this, hex);

    if (keys) {
      guest.setCrypto(keys);
    }

    this.isGuestOf.set(hex, guest);

    return guest;
  }

  storeAll() {
    let allHosts = [...this.isHosting.entries()];
    let allGuests = [...this.isGuestOf.entries()];

    let hostIds = allHosts.map(([id]) => id);
    let guestIds = allGuests.map(([id]) => id);

    store('hosting', hostIds);
    store('guests', guestIds);

    for (let [id, host] of allHosts) {
      store(`host-${id}`, host.serialize());
    }

    for (let [gameId, guest] of allGuests) {
      store(`guest-${gameId}`, guest.serialize());
    }
  }

  async loadHosts() {
    try {
      await this._loadHosts();
    } catch (e) {
      localStorage.setItem('GameManager#loadAll:error (hosts)', JSON.stringify(e));
    }

    let hostIds = loadWithDefault('hosting', []) as string[];

    hostIds.map((id) => localStorage.removeItem(`host-${id}`));
    localStorage.removeItem('hosting');
  }

  async loadGuests() {
    try {
      await this._loadGuests();
    } catch (e) {
      localStorage.setItem('GameManager#loadAll:error (guests)', JSON.stringify(e));
    }

    let hostIds = loadWithDefault('guests', []) as string[];

    hostIds.map((id) => localStorage.removeItem(`guest-${id}`));
    localStorage.removeItem('guests');
  }

  async _loadHosts() {
    let hostIds = loadWithDefault('hosting', []);

    for (let id of hostIds) {
      let hostData = loadWithDefault(`host-${id}`) as SerializedHost;

      if (hostData) {
        let publicKey = fromHex(hostData.id);
        let privateKey = fromHex(hostData.privateKey);
        let host = await this.createHost({
          publicKey,
          privateKey,
        });

        host.players = hostData.players.map((player) => {
          return {
            name: player.name,
            publicKeyAsHex: player.id,
            publicKey: fromHex(player.id),
          };
        });

        host.currentGame = GameRound.loadFrom(host.players, hostData.gameRound);
      }
    }
  }

  async _loadGuests() {
    let guestIds = loadWithDefault('guests', []);

    await timeout(2000);

    for (let gameId of guestIds) {
      let guestData = loadWithDefault(`guest-${gameId}`) as SerializedGuest;

      if (!guestData) {
        localStorage.removeItem(`guest-${gameId}`);
        continue;
      }

      if (guestData) {
        let publicKey = fromHex(guestData.publicKey);
        let privateKey = fromHex(guestData.privateKey);

        let guest = await this.connectToHost(guestData.gameId, { publicKey, privateKey });

        guest.setTarget(guestData.gameId);

        await guest.sendToHex({ type: 'REQUEST_STATE' }, guestData.gameId);
      }
    }
  }
}

function loadWithDefault<T>(key: string, defaultValue?: T) {
  let lsValue = localStorage.getItem(key);

  if (!lsValue) return defaultValue;

  let { value } = JSON.parse(lsValue) || {};

  return value || defaultValue;
}

function store<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify({ value }));
}
