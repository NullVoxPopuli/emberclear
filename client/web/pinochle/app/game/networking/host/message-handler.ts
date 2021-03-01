import { action } from '@ember/object';

import { use } from 'ember-could-get-used-to-this';

import { Statechart } from 'pinochle/utils/use-machine';

import { statechart } from './statecharts/message-handler';

import type { GameHost } from '../host';
import type { Context, Event, Schema } from './statecharts/message-handler';
import type { MessageFromGuest } from './types';

const MAX_PLAYERS = 4;
const MIN_PLAYERS = 3;

export class MessageHandler {
  constructor(public host: GameHost) {}

  @use
  interpreter = new Statechart<Context, Schema, Event>(() => {
    return {
      named: {
        chart: statechart,
        config: {
          actions: {
            addPlayerToGame: (_, { fromId, name }) => this.host._addPlayer({ name }, fromId),
            broadcastPlayerList: this.host._broadcastPlayerList,
            notifyGameIsFull: (_, { fromId }) => this._gameFull(fromId),
            beginGame: this.host.beginGame,
            ping: (_, { fromId }) => this._ping(fromId),
            pong: (_, { fromId }) => this._pong(fromId),
          },
          guards: {
            isGameFull: this.isGameFull,
            hasEnoughPlayers: this.hasEnoughPlayers,
            isPlayerKnown: (_, { fromId }) => this.host._isPlayerKnown(fromId),
          },
        },
      },
    };
  });

  @action
  handle(msg: MessageFromGuest) {
    this.interpreter.send(msg);
  }

  @action
  isGameFull() {
    return this.host.players.length <= MAX_PLAYERS;
  }

  @action
  hasEnoughPlayers() {
    return this.host.players.length >= MIN_PLAYERS;
  }

  @action
  _ping(toId: string) {
    this.host.sendToHex({ type: 'PING' }, toId);
  }

  @action
  _pong(toId: string) {
    this.host.sendToHex({ type: 'PONG' }, toId);
  }

  @action
  _notRecognized(toId: string) {
    this.host.sendToHex({ type: 'NOT_RECOGNIZED' }, toId);
  }

  @action
  _gameFull(toId: string) {
    this.host.sendToHex({ type: 'GAME_FULL' }, toId);
  }
}
