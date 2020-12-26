import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { use } from 'ember-could-get-used-to-this';
import { TrackedArray } from 'tracked-built-ins';

import { Statechart } from 'pinochle/utils/use-machine';

import { fromHex, toHex } from '@emberclear/encoding/string';
import { EphemeralConnection } from '@emberclear/networking';
import { UnknownMessageError } from '@emberclear/networking/errors';

import { statechart } from './-statechart';
import { GameRound } from './game-round';

import type { SerializedRound } from './game-round';
import type { GameMessage, GuestPlayer, SerializablePlayer } from './types';
import type { EncryptableObject, EncryptedMessage } from '@emberclear/crypto/types';

export type SerializedHost = {
  id: string;
  privateKey: string;
  players: SerializablePlayer[];
  gameRound: SerializedRound;
};

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

  @use
  interpreter = new Statechart(() => {
    return { named: { chart: statechart, config: { actions: {} } } };
  });

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
        if (this.isKnown(data.uid)) {
          if (this.currentGame) {
            this.sendStateTo(data.uid);
          } else {
            this.__updatePlayersWithParticipants();
          }
        } else {
          this._addPlayer(decrypted, data.uid);
        }

        return;
      case 'SYN':
        this.sendToHex({ type: 'ACK' }, data.uid);

        return;
      case 'REQUEST_STATE':
        if (this.isKnown(data.uid)) {
          this.sendStateTo(data.uid);
        } else {
          this.sendToHex({ type: 'NOT_RECOGNIZED' }, data.uid);
        }

        return;
      default:
        console.debug(data, decrypted);
        throw new UnknownMessageError();
    }
  }

  @action
  isKnown(id: string) {
    let player = this.players.find((player) => player.publicKeyAsHex === id);

    return Boolean(player);
  }

  @action
  sendStateTo(id: string) {
    return this.sendToHex(
      {
        type: 'GUEST_UPDATE',
        ...this.buildStateFor(id),
      },
      id
    );
  }

  @action
  buildStateFor(id: string) {
    let hand = (this.currentGame.hands[id] as unknown) as EncryptableObject;

    return {
      hand,
      info: this.currentGame.info,
      currentPlayer: this.currentGame.currentPlayer,
      gamePhase: this.currentGame.phase,
      // scoreHistory: this.scoreHistory,
    };
  }

  @action
  startGame() {
    this.currentGame = new GameRound(this.players);

    for (let player of this.players) {
      this.sendToHex(
        {
          type: 'START',
          ...this.buildStateFor(player.publicKeyAsHex),
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

  @action
  serialize() {
    return {
      id: this.hexId,
      privateKey: toHex(this.crypto.keys.privateKey),
      players: this.players.map((player) => ({
        name: player.name,
        id: player.publicKeyAsHex,
      })),
      gameRound: this.currentGame.toJSON(),
    };
  }
}
