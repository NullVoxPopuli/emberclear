import Ember from 'ember';
import { cached, tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { waitFor } from '@ember/test-waiters';

import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import RSVP from 'rsvp';

import { isDestroyed } from 'pinochle/utils/container';

import { toHex } from '@emberclear/encoding/string';
import { EphemeralConnection } from '@emberclear/networking';
import { UnknownMessageError } from '@emberclear/networking/errors';

import { DisplayInfo } from './guest/display-info';
import { GuestGameRound } from './guest/game-round';
import { verifyMessage } from './guest/utils';

import type { Card } from '../card';
import type { GameMessage, GameState, WelcomeMessage } from './types';
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

  /**
   * Initialized upon receiving host game state
   */
  @tracked declare display: DisplayInfo;
  @tracked declare gameId?: string;

  gameState = new GuestGameRound();

  constructor(publicKeyAsHex: string) {
    super(publicKeyAsHex);

    this.gameId = this.target?.hex;
  }

  get playerOrder() {
    return this.gameState.playerOrder;
  }

  get joinUrl() {
    let { origin } = window.location;

    return `${origin}/join/${this.gameId}`;
  }

  @cached
  get me() {
    let id = toHex(this.crypto.keys.publicKey);

    return this.gameState.playersById[id];
  }

  @action
  async checkHost() {
    try {
      this._checkHost.perform();
    } catch {
      /* host doesn't exist here. report error? */
    }

    return this.hostExists.promise;
  }

  @task
  _checkHost = taskFor(async () => {
    let backoff = 1;
    let waitingForHost = true;

    this.hostExists.promise.then(() => {
      waitingForHost = false;
    });

    while (waitingForHost) {
      await timeout(1000 * backoff);

      try {
        await this.send({ type: 'SYN' });
      } catch (e) {
        // this is a healthcheck, we don't care about failures
        console.debug(e);
      }

      backoff = backoff * 1.5;

      if (Ember.testing && backoff > 5) {
        break;
      }
    }
  });

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
  @waitFor
  async onData(data: EncryptedMessage) {
    if (isDestroyed(this)) return;

    let decrypted: GameMessage = await this.crypto.decryptFromSocket(data);

    // console.log('guest received:', {
    //   gameId: data.uid,
    //   ...decrypted,
    // });

    if (isDestroyed(this)) return;

    switch (decrypted.type) {
      case 'ACK':
        this.hostExists.resolve();
        this.gameId = data.uid;
        await this.sendToHex({ type: 'PRESENT' }, data.uid);

        return;
      case 'WELCOME':
        this.handleWelcome(decrypted);

        return;

      case 'START':
        this.startGame(decrypted);

        return;
      case 'GAME_FULL':
        this.router.transitionTo('/game-full');

        return;
      case 'NOT_RECOGNIZED':
        this.router.transitionTo('/not-recognized');

        return;
      case 'GUEST_UPDATE':
        assert(
          `${decrypted.type} has invalid payload: ${JSON.stringify(decrypted)}`,
          verifyMessage(decrypted)
        );
        this.updateGameState(decrypted);
        this.redirectToGame();

        return;
      case 'CONNECTIVITY_CHECK':
        await this.sendToHex({ type: 'PRESENT' }, data.uid);

        return;
      default:
        console.debug('guest received:', data, decrypted);
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
      this.display = new DisplayInfo(this.hexId, this.gameState);
    }

    this.gameState.update(decrypted);
    this.display.update(decrypted.info);
  }

  @action
  handleWelcome(decrypted: WelcomeMessage) {
    this.gameState._updatePlayers(decrypted);
    this.isWelcomed.resolve();
  }

  @action
  redirectToGame() {
    if (this.router.currentRouteName !== 'game') {
      if (this.gameId) {
        this.router.transitionTo(`/game/${this.gameId}`);
      }
    }
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
