import { cached, tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';

import RSVP from 'rsvp';
import { TrackedObject } from 'tracked-built-ins';

import { fromHex, toHex } from '@emberclear/encoding/string';
import { EphemeralConnection } from '@emberclear/networking';
import { UnknownMessageError } from '@emberclear/networking/errors';

import type { Card } from '../card';
import type { GamePhase } from './constants';
import type {
  GameInfo,
  GameMessage,
  GameResult,
  GameState,
  GuestPlayer,
  WelcomeMessage,
} from './types';
import type { EncryptedMessage } from '@emberclear/crypto/types';

export type SerializedGuest = {
  gameId: string;
  publicKey: string;
  privateKey: string;
};

/**
 * TODO:
 * - given a hex / public key as hex, connect to a host
 * - receive turn order
 * - receive hands
 * - handle when the host says a new game should happen
 *
 */
export class GameGuest extends EphemeralConnection {
  hostExists = RSVP.defer();
  isWelcomed = RSVP.defer();
  isStarted = RSVP.defer();

  @tracked gameId?: string;
  @tracked hand: Card[] = [];
  @tracked currentPlayer?: string;
  @tracked scoreHistory: GameResult[] = [];
  @tracked gamePhase: GamePhase = 'meld';
  @tracked gameInfo?: GameInfo;
  @tracked playersById: Record<string, GuestPlayer> = new TrackedObject();

  @cached
  get players() {
    return Object.values(this.playersById);
  }

  @cached
  get playerOrder() {
    if (!this.gameInfo) {
      return [];
    }

    return this.gameInfo.playerOrder.map((id) => {
      return this.playersById[id];
    });
  }

  @action
  async checkHost() {
    await this.send({ type: 'SYN' });

    return this.hostExists.promise;
  }

  @action
  async joinHost(name: string) {
    await this.send({ type: 'JOIN', name });

    return this.isWelcomed.promise;
  }

  @action
  waitForStart() {
    return this.isStarted.promise;
  }

  @action
  async onData(data: EncryptedMessage) {
    let decrypted: GameMessage = await this.crypto.decryptFromSocket(data);

    console.log({ decrypted });

    switch (decrypted.type) {
      case 'ACK':
        this.hostExists.resolve();
        this.gameId = data.uid;

        return;
      case 'WELCOME':
        this.updatePlayers(decrypted);
        this.isWelcomed.resolve();

        return;

      case 'START':
        this.startGame(decrypted);

        return;
      case 'GUEST_UPDATE':
        this.updateGameState(decrypted);

        return;
      default:
        console.debug(data, decrypted);
        throw new UnknownMessageError();
    }
  }

  @action
  updatePlayers(msg: WelcomeMessage) {
    for (let { name, id } of msg.players) {
      this.playersById[id] = {
        name,
        publicKeyAsHex: id,
        publicKey: fromHex(id),
      };
    }
  }

  @action
  startGame(decrypted: GameState) {
    this.updateGameState(decrypted);
    this.isStarted.resolve();
  }

  @action
  updateGameState(decrypted: GameState) {
    this.currentPlayer = decrypted.currentPlayer;
    this.hand = decrypted.hand;
    this.scoreHistory = decrypted.scoreHistory;
    this.gamePhase = decrypted.gamePhase;
    this.gameInfo = decrypted.info;
  }

  /**
   * Guests don't need to store much, because the host stores all the data
   *
   * Guests just need to be aware that they existed.
   */
  @action
  serialize() {
    if (!this.gameId) return;

    let keys = this.crypto.keys;

    return {
      gameId: this.gameId,
      publicKey: toHex(keys.publicKey),
      privateKey: toHex(keys.privateKey),
    };
  }
}
