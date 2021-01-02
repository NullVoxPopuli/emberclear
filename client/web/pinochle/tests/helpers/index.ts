import { getService } from '@emberclear/test-helpers/test-support';

import type { GameGuest } from 'pinochle/app/game/networking/guest';
import type { GameHost } from 'pinochle/game/networking/host';

export function setupGameHost(hooks: NestedHooks, onDone: (host: GameHost) => void) {
  let host: GameHost;

  hooks.beforeEach(async function () {
    let gameManager = getService('game-manager');

    host = await gameManager.createHost();
    host.shouldCheckConnectivity = false;

    onDone(host);
  });

  hooks.afterEach(function () {
    host.disconnect();
  });
}

export function setupPlayer(hooks: NestedHooks, host: GameHost, name: string) {
  let player: GameGuest;

  hooks.beforeEach(async function () {
    player = addPlayerToHost(host, name);
  });

  hooks.afterEach(function () {
    player.disconnect();
  });
}

export async function addPlayerToHost(host: GameHost, name?: string) {
  let gameManager = getService('game-manager');

  let playerGame = await gameManager.connectToHost(host.hexId);

  await playerGame.checkHost();
  await playerGame.joinHost(name || 'Test Player');

  return playerGame;
}
