import { cached } from '@glimmer/tracking';
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

import { GameRound } from './host/game-round';
import { MessageHandler } from './host/message-handler';
import { unwrapObject } from './host/utils';

// import { UnknownMessageError } from '@emberclear/networking/errors';
import type { PlayerInfo } from './host/types';
import type { GameMessage } from './types';
import type { EncryptedMessage } from '@emberclear/crypto/types';

export class GameHost extends EphemeralConnection {
  declare handler: MessageHandler;
  declare currentGame: GameRound;

  playersById = new TrackedObject<Record<string, PlayerInfo>>();

  shouldCheckConnectivity = true;

  constructor(...args: [string | undefined]) {
    super(...args);

    this.handler = new MessageHandler(this);
  }

  teardown() {
    this.onlineChecker.cancelAll();

    super.teardown();
  }

  @cached
  get players() {
    return Object.values(this.playersById);
  }

  get joinUrl() {
    let { origin } = window.location;

    return `${origin}/join/${this.hexId}`;
  }

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

    this.handler.handle({ fromId: data.uid, ...decrypted });
  }

  /**
   * Called from button in the UI from the Host
   */
  @action
  startGame() {
    this.handler.interpreter.send({ type: 'UI__START_GAME' });
  }

  @action
  beginGame() {
    this.onlineChecker.perform();
    this.currentGame = new GameRound(unwrapObject(this.playersById));

    this._broadcastPlayerList();
  }

  @action
  _isPlayerKnown(id: string) {
    let player = this.players.find((player) => player.publicKeyAsHex === id);

    return Boolean(player);
  }

  @action
  _addPlayer({ name }: { name: string }, publicKeyAsHex: string) {
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

    for (let player of this.players) {
      this.sendToHex(
        {
          type: 'STATE',
          players: serializablePlayers,
          ...this.currentGame?.stateForPlayer?.(player.publicKeyAsHex),
        },
        player.publicKeyAsHex
      );
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

          this.sendToHex({ type: 'PING' }, player.publicKeyAsHex);
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
