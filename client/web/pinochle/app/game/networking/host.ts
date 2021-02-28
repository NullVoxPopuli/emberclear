import { cached } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { waitFor } from '@ember/test-waiters';

import { timeout } from 'ember-concurrency';
import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import RSVP from 'rsvp';
import { TrackedObject } from 'tracked-built-ins';

import { isDestroyed } from 'pinochle/utils/container';

import { fromHex, toHex } from '@emberclear/encoding/string';
import { EphemeralConnection } from '@emberclear/networking';

// import { UnknownMessageError } from '@emberclear/networking/errors';
import { GameRound } from './host/game-round';
import { unwrapObject } from './host/utils';

import type { PlayerInfo } from './host/types';
import type { GameMessage } from './types';
import type { EncryptedMessage } from '@emberclear/crypto/types';

const MAX_PLAYERS = 4;
// const MIN_PLAYERS = 3;

/**
 * TODO:
 *  - track number of people connected
 *  - put those people in an order, with option to shuffle (us included)
 *  - implement card communication
 *  - add the ability to restart a game at any time
 *    - useful for the home rule of too many 9s
 */
export class GameHost extends EphemeralConnection {
  playersById = new TrackedObject<Record<string, PlayerInfo>>();

  shouldCheckConnectivity = true;

  declare currentGame: GameRound;

  teardown() {
    this.onlineChecker.cancelAll();
    // this.currentGame?.interpreter

    super.teardown();
  }

  @cached
  get players() {
    return Object.values(this.playersById);
  }

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

  /**
   * 4 Types of messages:
   * - 1. Always
   * - 2. Only during a game
   * - 3. Always outside of a game
   * - 4. When the player is known
   *
   * All other messages a dropped
   *
   */
  @action
  @waitFor
  async onData(data: EncryptedMessage) {
    if (isDestroyed(this)) return;

    let decrypted: GameMessage = await this.crypto.decryptFromSocket(data);

    if (isDestroyed(this)) return;

    if (!this._isPlayerKnown(data.uid)) {
      this._markOnline(data.uid);
    }
    // console.debug('host received:', {
    //   from: data.uid,
    //   ...decrypted,
    //   isKnown: this._isPlayerKnown(data.uid),
    //   hasGame: Boolean(this.currentGame),
    // });

    if (this.currentGame) {
      if (!this._isPlayerKnown(data.uid)) {
        return this._notRecognized(data.uid);
      }

      switch (decrypted.type) {
        case 'SYN':
          this._ack(data.uid);

          return this._broadcastPlayerList();
        case 'JOIN':
          return this._sendState(data.uid);
        case 'REQUEST_STATE':
          return this._sendState(data.uid);
        case 'PRESENT':
          return this._markOnline(data.uid);
        case 'BID':
          this.currentGame.bid(decrypted);

          return;
        case 'PLAY_CARD':
          // TODO:
          // - is valid play
          // - make the play
          // - remove card from hand
          // - send update to everyone
          return;
      }

      return;
    }

    switch (decrypted.type) {
      case 'SYN':
        return this._ack(data.uid);
      case 'JOIN':
        if (this.players.length <= MAX_PLAYERS) {
          return this._addPlayer(decrypted, data.uid);
        }

        return;
    }

    if (this._isPlayerKnown(data.uid)) {
      switch (decrypted.type) {
        case 'REQUEST_STATE':
          return this._sendState(data.uid);
        case 'PRESENT':
          return this._markOnline(data.uid);
      }
    }

    console.debug('host unexpectedly received:', {
      data,
      ...decrypted,
      isKnown: this._isPlayerKnown(data.uid),
      hasGame: Boolean(this.currentGame),
    });
  }

  /**
   * Called from button in the UI from the Host
   */
  @action
  startGame() {
    this.onlineChecker.perform();
    this.currentGame = new GameRound(unwrapObject(this.playersById));

    this._broadcastStart();
  }

  /*************************************
   * State Machine Helpers
   ************************************/
  @action
  _broadcastStart() {
    for (let player of this.players) {
      this.sendToHex(
        {
          type: 'START',
          ...this.currentGame.stateForPlayer(player.publicKeyAsHex),
        },
        player.publicKeyAsHex
      );
    }
  }

  @action
  _broadcastState() {
    for (let player of this.players) {
      this._sendState(player.id);
    }
  }

  @action
  _sendState(id: string) {
    return this.sendToHex(
      {
        type: 'GUEST_UPDATE',
        ...this.currentGame.stateForPlayer(id),
      },
      id
    );
  }

  // @action
  // _requestBid(id: string) {}

  // @action
  // _requestTurn(id: string) {}

  @action
  _notRecognized(id: string) {
    this.sendToHex({ type: 'NOT_RECOGNIZED' }, id);
  }

  @action
  _ack(id: string) {
    this.sendToHex({ type: 'ACK' }, id);
  }

  @action
  _gameFull(id: string) {
    this.sendToHex({ type: 'GAME_FULL' }, id);
  }

  @action
  _isPlayerKnown(id: string) {
    let player = this.players.find((player) => player.publicKeyAsHex === id);

    return Boolean(player);
  }

  @action
  _addPlayer({ name }: { name: string }, publicKeyAsHex: string) {
    if (this.players.length === MAX_PLAYERS) {
      this.sendToHex({ type: 'GAME_FULL' }, publicKeyAsHex);

      return;
    }

    this.playersById[publicKeyAsHex] = {
      publicKeyAsHex,
      name,
      id: publicKeyAsHex,
      publicKey: fromHex(publicKeyAsHex),
    };

    this._broadcastPlayerList();
  }

  @action
  _broadcastPlayerList() {
    let serializablePlayers = this.players.map((player) => ({
      id: player.publicKeyAsHex,
      name: player.name,
      isOnline: player.isOnline,
    }));

    for (let player of this.otherPlayers) {
      this.sendToHex({ type: 'WELCOME', players: serializablePlayers }, player.publicKeyAsHex);
    }
  }

  @action
  _markOnline(uid: string) {
    let player = this.playersById[uid];

    player.isOnline = true;
    player.onlineCheck?.resolve(true);
  }

  /**************************************
   * Utilities
   *************************************/

  @action
  serialize() {
    return {
      id: this.hexId,
      privateKey: toHex(this.crypto.keys.privateKey),
      players: this.players.map((player) => ({
        name: player.name,
        id: player.publicKeyAsHex,
        isOnline: player.isOnline,
      })),
      gameRound: this.currentGame?.toJSON(),
    };
  }

  @dropTask
  onlineChecker = taskFor(async () => {
    // this loop takes 7s per iteration
    // eslint-disable-next-line no-constant-condition
    while (this.shouldCheckConnectivity) {
      await timeout(2000);

      let promises = this.players.map(async (player) => {
        if (!player.onlineCheck) {
          player.onlineCheck = RSVP.defer();

          this.sendToHex({ type: 'CONNECTIVITY_CHECK' }, player.publicKeyAsHex);
        }

        return RSVP.race([player.onlineCheck.promise, timeout(5000)]).then((value) => {
          if (!value) {
            player.isOnline = false;
          }
        });
      });

      await Promise.all(promises);

      this._broadcastPlayerList();

      this.players.map((player) => (player.onlineCheck = undefined));
    }
  });
}
