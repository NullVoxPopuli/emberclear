import { action } from '@ember/object';

import { use } from 'ember-could-get-used-to-this';

import { Statechart } from 'pinochle/utils/use-machine';

import { statechart } from './game-state';
import { handById, serializePlayer } from './utils';

import type { GamePhase } from '../constants';
import type { Bid } from '../types';
import type { Context, Event, Schema } from './game-state';
import type { PlayerInfo } from './types';
import type { EncryptableObject } from '@emberclear/crypto/types';
import type { Card, Suit } from 'pinochle/game/card';
import type { State } from 'xstate';

export type SerializedRound = {
  hands: Record<string, Card[]>;
  blind: Card[];
  playerOrder: string[];
  playerWhoTookTheBid: string;
  currentPlayer: string;
  phase: GamePhase;
  bid: number;
  trump: Suit;
  state: State<Context, Event>;
};

export class GameRound {
  static loadFrom(players: Record<string, PlayerInfo>, data: SerializedRound) {
    let round = new GameRound(players, data?.state);

    return round;
  }

  declare _initialState?: State<Context, Event>;

  /**
   * players must be passed in in-order
   *
   */
  constructor(protected playersById: Record<string, PlayerInfo>, state?: State<Context, Event>) {
    this._initialState = state;
  }

  @use
  interpreter = new Statechart<Context, Schema, Event>(() => {
    return {
      named: {
        chart: statechart,
        ...(this._initialState ? { initialState: this._initialState } : {}),
        context: {
          playersById: this.playersById as TODO,
          hasBlind: false,
          currentPlayer: '',
          bids: {},
          playerOrder: [],
          melds: {},
          isForfeiting: false,
        },
        config: {
          // actions: {
          // sendState: this._sendState,
          // sendWelcome: this._broadcastJoin,
          // addPlayer: this._addPlayer,
          // Networky things
          // Game Actions
          // deal: this._deal,
          // },
        },
      },
    };
  });

  get context() {
    return this.interpreter.state?.context || ({} as Context);
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
    let { playersById, currentPlayer, playerOrder, playerWhoTookTheBid, bid, trump } = this.context;
    let player = playersById[id];

    return ({
      hand: player.hand,
      currentPlayer,
      info: {
        playerOrder,
        players: Object.values(playersById).map(serializePlayer),
        playerWhoTookTheBid,
        bid,
        trump,
      },
    } as unknown) as EncryptableObject;
  }

  @action
  bid({ bid }: Pick<Bid, 'bid'>) {
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
    } = this.interpreter.state.context;

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
