import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import RSVP from 'rsvp';

import { toHex } from '@emberclear/encoding/string';
import { EphemeralConnection } from '@emberclear/networking';
import { UnknownMessageError } from '@emberclear/networking/errors';

import { DisplayInfo } from './-display-info';
import { GuestGameRound } from './guest/game-round';

import type { Card } from '../card';
import type { GameMessage, GameState } from './types';
import type RouterService from '@ember/routing/router-service';
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
  @service declare router: RouterService;

  hostExists = RSVP.defer();
  isWelcomed = RSVP.defer();
  isStarted = RSVP.defer();

  waitingForCardPlayConfirmation = RSVP.defer();
  waitingForBidConfirmation = RSVP.defer();
  waitingForTrumpDeclaration = RSVP.defer();

  declare display: DisplayInfo;
  gameState = new GuestGameRound();

  @tracked gameId?: string;

  get playerOrder() {
    return this.gameState.playerOrder;
  }

  @cached
  get me() {
    let id = toHex(this.crypto.keys.publicKey);

    return this.gameState.playersById[id];
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

    switch (decrypted.type) {
      case 'ACK':
        this.hostExists.resolve();
        this.gameId = data.uid;

        return;
      case 'WELCOME':
        this.gameState._updatePlayers(decrypted);
        this.isWelcomed.resolve();

        return;

      case 'START':
        this.startGame(decrypted);

        return;
      case 'GAME_FULL':
        this.router.transitionTo('/game-full');

        return;
      case 'GUEST_UPDATE':
        this.updateGameState(decrypted);

        return;
      case 'CONNECTIVITY_CHECK':
        this.sendToHex({ type: 'PRESENT' }, data.uid);

        return;
      default:
        console.debug(data, decrypted);
        throw new UnknownMessageError();
    }
  }

  /**
   * All dispatched commands are merely suggestions to the host
   * the host must verify and "OK" all actions
   *
   *
   */
  @action
  async playCard(card: Card) {
    await this.send({ type: 'PLAY_CARD', id: card.id });
  }

  @action
  startGame(decrypted: GameState) {
    this.updateGameState(decrypted);
    this.isStarted.resolve();
  }

  @action
  updateGameState(decrypted: GameState) {
    if (!this.display) {
      this.display = new DisplayInfo(this.hexId);
    }

    if (this.router.currentRouteName !== 'game') {
      this.router.transitionTo(`/game/${this.gameId}`);
    }

    this.gameState.update(decrypted);
    this.display.update(decrypted.info);
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
