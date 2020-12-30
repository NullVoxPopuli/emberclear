import { action } from '@ember/object';

import { use } from 'ember-could-get-used-to-this';

import { Statechart } from 'pinochle/utils/use-machine';

import { statechart } from './game-state';
import { handById } from './utils';

import type { GamePhase } from '../constants';
import type { Context, Event, Schema } from './game-state';
import type { PlayerInfo } from './types';
import type { EncryptableObject } from '@emberclear/crypto/types';
import type { Card, Suit } from 'pinochle/game/card';

export type SerializedRound = {
  hands: Record<string, Card[]>;
  blind: Card[];
  playerOrder: string[];
  playerWhoTookTheBid: string;
  currentPlayer: string;
  phase: GamePhase;
  bid: number;
  trump: Suit;
  state: unknown;
};

export class GameRound {
  static loadFrom(players: Record<string, PlayerInfo>, data: SerializedRound) {
    let round = new GameRound(players, data?.state);

    return round;
  }

  declare _initialState: unknown;

  /**
   * players must be passed in in-order
   *
   */
  constructor(protected playersById: Record<string, PlayerInfo>, state?: unknown) {
    if (!state) {
      // placing this here causes an infinite loop?
      this.interpreter.send('START_ROUND');
    }

    this._initialState = state;
  }

  @use
  interpreter = new Statechart<Context, Schema, Event>(() => {
    return {
      named: {
        chart: statechart,
        // initialState: this._initialState,
        context: {
          playersById: this.playersById,
        },
        config: {
          actions: {
            // sendState: this._sendState,
            // sendWelcome: this._broadcastJoin,
            // addPlayer: this._addPlayer,
            // Networky things
            // Game Actions
            // deal: this._deal,
          },
        },
      },
    };
  });

  get context() {
    return this.interpreter.state.context;
  }

  get currentPlayer() {
    return this.context.currentPlayer;
  }

  get info() {
    let { trump, bid, playerWhoTookTheBid, playerOrder } = this.context;

    return {
      trump,
      bid,
      playerWhoTookTheBid,
      playerOrder,
    };
  }

  @action
  stateForPlayer(id: string) {
    let { playersById, currentPlayer, playerOrder } = this.context;
    let player = playersById[id];

    return ({
      hand: player.hand,
      currentPlayer,
      info: {
        playerOrder,
      },
    } as unknown) as EncryptableObject;
  }

  @action
  bid(bid: number) {
    this.interpreter.send('BID', { bid });
  }

  /*************************************
   * State Machine Helpers
   ************************************/

  /**************************************
   * Utilities
   *************************************/
  toJSON() {
    let {
      playersById,
      playerOrder,
      playerWhoTookTheBid,
      currentPlayer,
      bid,
      trump,
    } = this.interpreter.state!.context;

    let hands = handById(playersById);

    return {
      hands,
      playerOrder,
      playerWhoTookTheBid,
      currentPlayer,
      bid,
      trump,
      state: this.interpreter.state?.toJSON(),
    };
  }
}
