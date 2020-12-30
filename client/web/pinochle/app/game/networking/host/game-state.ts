/* eslint-disable @typescript-eslint/no-unused-vars */
import { assign, send } from 'xstate';

import { newDeck, splitDeck } from 'pinochle/game/deck';

import type { JoinMessage } from '../types';
import type { PlayerInfo } from './types';
import type { Card, Suit } from 'pinochle/game/card';
import type { MachineConfig, StateSchema } from 'xstate';

type Bid = {
  type: 'BID';
  bid: number | 'passed';
};
type Pass = { type: 'PASS' };
type DeclareTrump = { type: 'DECLARE_TRUMP'; trump: Suit };

type StartEvent = { type: 'START' } & Context;
export type Event =
  | Bid
  | Pass
  | ({ type: 'JOIN' } & JoinMessage)
  | { type: 'WON_BID' }
  | DeclareTrump
  | StartEvent
  | { type: 'FINISHED' }
  | { type: 'ACCEPT' }
  | { type: '__START_ROUND' }
  | { type: 'PLAY_CARD' }
  | { type: 'TRICK_CONTINUES' }
  | { type: 'TRICK_ENDS' }
  | { type: 'SUBMIT_MELD'; player: string; meld: number }
  | { type: 'FORFEIT' };

export interface Context {
  hasBlind: boolean;
  currentPlayer: string;
  playersById: Record<string, PlayerInfo & { hand: Card[] }>;
  playerOrder: string[];
  trump?: Suit;
  bid?: number;
  playerWhoTookTheBid?: string;
  bids: Record<string, number | 'passed'>;
  melds: Record<string, number>;
  isForfeiting: boolean;
}

export interface Schema extends StateSchema<Context> {
  idle: StateSchema<Context>;
  bidding: StateSchema<Context>;
  'won-bid': {
    states: {
      'pending-acceptance': StateSchema<Context>;
      accepted: StateSchema<Context>;
      discard: StateSchema<Context>;
    };
  };
  'declare-meld': StateSchema<Context>;
  'phase-trick-taking': {
    'pending-play': StateSchema<Context>;
    'evaluate-play': StateSchema<Context>;
  };
  'end-game': StateSchema<Context>;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function didPass(ctx: Context) {
  return ctx.bids[ctx.currentPlayer] === 'passed';
}

function bid() {
  return assign({
    bids: (ctx: Context, event: Bid) => {
      ctx.bids[ctx.currentPlayer] = event.bid;

      return ctx.bids;
    },
  });
}

function passBid() {
  return assign({
    bids: (ctx: Context) => {
      ctx.bids[ctx.currentPlayer] = 'passed';

      return ctx.bids;
    },
  });
}

function _nextPlayer(ctx: Context) {
  let players = ctx.playerOrder;
  let current = players.indexOf(ctx.currentPlayer);
  let nextIndex = current + (1 % players.length);

  return ctx.playerOrder[nextIndex];
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function nextPlayer() {
  return assign({
    currentPlayer: _nextPlayer,
  });
}

function nextBiddingPlayer() {
  return assign({
    currentPlayer: (ctx: Context) => {
      let nextPlayer: undefined | string = undefined;

      for (let i = 0; i < ctx.playerOrder.length; i++) {
        nextPlayer = _nextPlayer(ctx);

        if (ctx.bids[nextPlayer] !== 'passed') {
          break;
        }
      }

      if (!nextPlayer) {
        throw new Error('all players are not allowed to pass');
      }

      return nextPlayer;
    },
  });
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function setTrump() {
  return assign<Context>({ trump: (_ctx: Context, event: DeclareTrump) => event.trump });
}

function playersWithBids(ctx: Context) {
  let ids = [];

  for (let [playerId, bidValue] of Object.entries(ctx.bids)) {
    if (bidValue !== 'passed') {
      ids.push(playerId);
    }
  }

  return ids;
}

function isBiddingOver(ctx: Context) {
  return playersWithBids(ctx).length === 1;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function setBidWinnerInfo() {
  return assign<Context>({
    currentPlayer: (ctx: Context) => playersWithBids(ctx)[0],
    playerWhoTookTheBid: (ctx: Context) => playersWithBids(ctx)[0],
    bid: (ctx: Context) => {
      let player = playersWithBids(ctx)[0];
      let bid = ctx.bids[player];

      if (!bid || bid === 'passed') {
        throw new Error('Invalid bid');
      }

      return bid;
    },
  });
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function hasEveryoneSubmittedMeld() {
  return false;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function hasBlind(ctx: Context) {
  return ctx.hasBlind;
}

function deal(context: Context) {
  let { playersById, playerOrder } = context;
  let deck = newDeck();
  let { hands, remaining } = splitDeck(deck, playerOrder.length);

  for (let i = 0; i < playerOrder.length; i++) {
    let id = playerOrder[i];
    let player = playersById[id];

    player.hand = hands[i];
  }

  return assign({
    blind: () => remaining,
    currentPlayer: () => playerOrder[0],
  });
}

// TODO: Rotate from previousOrder
function setPlayerOrder(context: Context, { previousOrder }: TODO) {
  if (!previousOrder) {
    return Object.keys(context.playersById);
  }

  throw new Error('Not implemented');
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  id: 'host-game-state',
  initial: 'idle',
  context: {
    // hasBlind: false,
    // currentPlayer: '1',
    // players: [],
    // trump: '',
    // bid: null,
    // playerWhoTookTheBid: null,
    isForfeiting: false,
    bids: {},
    melds: {},
  },
  states: {
    idle: {
      entry: [
        assign({
          playerOrder: setPlayerOrder,
        }),
        send('__START_ROUND__'),
      ],
      on: {
        __START_ROUND__: 'dealing',
      },
    },
    dealing: {
      entry: [deal, send('DONE')],
      on: {
        DONE: 'bidding',
      },
    },
    bidding: {
      on: {
        BID: [
          {
            target: 'bidding',
            actions: [bid, nextBiddingPlayer],
          },
        ],
        PASS: [
          {
            cond: isBiddingOver,
            // target: 'won-bid',
          },
          {
            target: 'bidding',
            actions: [passBid, nextBiddingPlayer],
          },
        ],
      },
    },
    // 'won-bid': {
    //   id: 'winBid',
    //   initial: 'pending-acceptance',
    //   entry: ['setBidWinnerInfo', 'giveBlind'],
    //   states: {
    //     'pending-acceptance': {
    //       on: {
    //         ACCEPT: {
    //           target: 'accepted',
    //         },
    //         FORFEIT: {
    //           target: '#game.declare-meld',
    //           actions: [assign<Context>({ isForfeiting: () => true })],
    //         },
    //       },
    //     },
    //     accepted: {
    //       on: {
    //         DECLARE_TRUMP: [
    //           {
    //             cond: hasBlind,
    //             actions: setTrump,
    //             target: '#winBid.discard',
    //           },
    //           {
    //             target: '#game.declare-meld',
    //             actions: setTrump,
    //           },
    //         ],
    //       },
    //     },
    //     discard: {
    //       on: {
    //         FINISHED: '#game.declare-meld',
    //       },
    //     },
    //   },
    // },

    // 'declare-meld': {
    //   on: {
    //     SUBMIT_MELD: [
    //       {
    //         cond: hasEveryoneSubmittedMeld,
    //         target: '#game.phase-trick-taking',
    //       },
    //       { target: '#game.declare-meld' },
    //     ],
    //   },
    // },
    // 'phase-trick-taking': {
    //   entry: ['storePreviousTrick', 'newTrick', 'determineFirstPlayer'],
    //   states: {
    //     'pending-play': {
    //       on: {
    //         PLAY_CARD: 'evaluate-play',
    //       },
    //     },
    //     'evaluate-play': {
    //       on: {
    //         TRICK_CONTINUES: { actions: 'nextPlayer', target: 'pending-play' },
    //         TRICK_ENDS: [
    //           {
    //             cond: 'isGameOver',
    //             target: '#game.end-game',
    //           },
    //           { target: '#game.phase-trick-taking' },
    //         ],
    //       },
    //     },
    //   },
    // },
    // 'end-game': {},
  },
};
