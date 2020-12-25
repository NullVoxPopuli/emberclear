import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { TrackedArray } from 'tracked-built-ins';

import { fromHex } from '@emberclear/encoding/string';
import { EphemeralConnection } from '@emberclear/networking';
import { UnknownMessageError } from '@emberclear/networking/errors';

import { GameRound } from './game-round';

import type { GameMessage, GuestPlayer } from './types';
import type { EncryptableObject, EncryptedMessage } from '@emberclear/crypto/types';

const MAX_PLAYERS = 4;

/**
 * TODO:
 *  - track number of people connected
 *  - put those people in an order, with option to shuffle (us included)
 *  - implement card communication
 *  - add the ability to restart a game at any time
 *    - useful for the home rule of too many 9s
 */
export class GameHost extends EphemeralConnection {
  @tracked players = new TrackedArray() as GuestPlayer[];

  declare currentGame: GameRound;

  get otherPlayers() {
    return this.players.filter((player) => player.publicKeyAsHex !== this.hexId);
  }

  get numConnected() {
    return this.players.length;
  }

  get joinUrl() {
    let { origin } = window.location;

    return `${origin}/join/${this.hexId}`;
  }

  @action
  async onData(data: EncryptedMessage) {
    let decrypted: GameMessage = await this.crypto.decryptFromSocket(data);

    switch (decrypted.type) {
      case 'JOIN':
        this._addPlayer(decrypted, data.uid);

        return;
      case 'SYN':
        this.sendToHex({ type: 'ACK' }, data.uid);

        return;
      default:
        console.debug(data, decrypted);
        throw new UnknownMessageError();
    }
  }

  @action
  startGame() {
    this.currentGame = new GameRound(this.players);

    for (let player of this.players) {
      let hand = (this.currentGame.hands[player.publicKeyAsHex] as unknown) as EncryptableObject;

      this.sendToHex(
        {
          type: 'START',
          hand,
        },
        player.publicKeyAsHex
      );
    }
  }

  @action
  _addPlayer({ name }: { name: string }, publicKeyAsHex: string) {
    if (this.players.length === MAX_PLAYERS) {
      this.sendToHex({ type: 'GAME_FULL' }, publicKeyAsHex);

      return;
    }

    this.players.push({
      publicKeyAsHex,
      name,
      publicKey: fromHex(publicKeyAsHex),
    });

    this.__updatePlayersWithParticipants();
  }

  @action
  __updatePlayersWithParticipants() {
    let serializablePlayers = this.players.map((player) => ({
      id: player.publicKeyAsHex,
      name: player.name,
    }));

    for (let player of this.otherPlayers) {
      this.sendToHex({ type: 'WELCOME', players: serializablePlayers }, player.publicKeyAsHex);
    }
  }
}
