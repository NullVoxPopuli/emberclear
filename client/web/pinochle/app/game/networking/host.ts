import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { timeout } from 'ember-concurrency';
import { dropTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import { use } from 'ember-could-get-used-to-this';
import RSVP from 'rsvp';
import { TrackedArray, TrackedObject } from 'tracked-built-ins';

import { Statechart } from 'pinochle/utils/use-machine';

import { fromHex, toHex } from '@emberclear/encoding/string';
import { EphemeralConnection } from '@emberclear/networking';
import { UnknownMessageError } from '@emberclear/networking/errors';

import { GameRound } from './host/game-round';
import { statechart } from './host/statechart';

import type { PlayerInfo } from './host/types';
import type { GameMessage } from './types';
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
  playersById = new TrackedObject<Record<string, PlayerInfo>>();

  declare currentGame: GameRound;

  constructor(publicKey?: string) {
    super(publicKey);

    this.onlineChecker.perform();
  }

  @use
  interpreter = new Statechart(() => {
    return {
      named: {
        chart: statechart,
        config: {
          actions: {
            sendState: this.sendStateTo,
            sendWelcome: this.__updatePlayersWithParticipants,
            addPlayer: this._addPlayer,
          },
        },
      },
    };
  });

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

  @action
  async onData(data: EncryptedMessage) {
    let decrypted: GameMessage = await this.crypto.decryptFromSocket(data);

    switch (decrypted.type) {
      case 'JOIN':
        // return this.interpreter.send({ ...decrypted, fromUid: data.uid });

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
      case 'PRESENT':
        this.markOnline(data.uid);

        return;
      case 'PLAY_CARD':
        // TODO:
        // - is valid play
        // - make the play
        // - remove card from hand
        // - send update to everyone
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

    this.playersById[publicKeyAsHex] = {
      publicKeyAsHex,
      name,
      id: publicKeyAsHex,
      publicKey: fromHex(publicKeyAsHex),
    };

    this.__updatePlayersWithParticipants();
  }

  @action
  __updatePlayersWithParticipants() {
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
  markOnline(uid: string) {
    let player = this.playersById[uid];

    player.isOnline = true;
    player.onlineCheck?.resolve(true);
  }

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
      gameRound: this.currentGame.toJSON(),
    };
  }

  @dropTask
  onlineChecker = taskFor(async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await timeout(2000);

      let promises = this.players.map(async (player) => {
        if (!player.onlineCheck) {
          player.onlineCheck = RSVP.defer();

          this.sendToHex({ type: 'CONNECTIVITY_CHECK' }, player.publicKeyAsHex);
        }

        return RSVP.race([player.onlineCheck, timeout(5000)]).then((value) => {
          if (!value) {
            player.isOnline = false;
          }
        });
      });

      await Promise.all(promises);

      this.__updatePlayersWithParticipants();

      this.players.map((player) => (player.onlineCheck = undefined));
    }
  });
}
