import { actions, assign, send } from 'xstate';

import type { JoinMessage } from '../types';
import type { Suit } from 'pinochle/game/card';
import type { MachineConfig, StateSchema } from 'xstate';

type Bid = {
  type: 'BID';
  bid: number | 'passed';
};
type Pass = { type: 'PASS' };
type DeclareTrump = { type: 'DECLARE_TRUMP'; trump: string };

type StartEvent = { type: 'START' } & Context;
type Event =
  | Bid
  | Pass
  | ({ type: 'JOIN' } & JoinMessage & NetworkMessage)
  | { type: 'WON_BID' }
  | DeclareTrump
  | StartEvent
  | { type: 'FINISHED' }
  | { type: 'ACCEPT' }
  | { type: 'PLAY_CARD' }
  | { type: 'TRICK_CONTINUES' }
  | { type: 'TRICK_ENDS' }
  | { type: 'SUBMIT_MELD'; player: string; meld: number }
  | { type: 'FORFEIT' };

interface Context {
  hasBlind: boolean;
  currentPlayer: string;
  // in order
  players: string[];
  trump?: Suit;
  bid?: number;
  playerWhoTookTheBid?: string;
  bids: Record<string, number | 'passed'>;
  melds: Record<string, number>;
  isForfeiting: boolean;
}

interface Schema extends StateSchema<Context> {
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
  let players = ctx.players;
  let current = players.indexOf(ctx.currentPlayer);
  let nextIndex = current + (1 % players.length);

  return ctx.players[nextIndex];
}

function nextPlayer() {
  return assign({
    currentPlayer: _nextPlayer,
  });
}

function nextBiddingPlayer() {
  return assign({
    currentPlayer: (ctx: Context) => {
      let nextPlayer: string;

      for (let i = 0; i < ctx.players.length; i++) {
        nextPlayer = _nextPlayer(ctx);

        if (ctx.bids[nextPlayer] !== 'passed') {
          break;
        }
      }

      return nextPlayer;
    },
  });
}

function setTrump() {
  return assign({ trump: (ctx, event: DeclareTrump) => event.trump });
}

function playersWithBids(ctx) {
  let ids = [];

  for (let [playerId, bidValue] of Object.entries(ctx.bids)) {
    if (bidValue !== 'passed') {
      ids.push(playerId);
    }
  }

  return ids;
}

function isBiddingOver(ctx) {
  return playersWithBids(ctx).length === 1;
}

function setBidWinnerInfo() {
  assign({
    currentPlayer: (ctx: Context) => playersWithBids(ctx)[0],
    playerWhoTookTheBid: (ctx: Context) => playersWithBids(ctx)[0],
    bid: (ctx: Context) => {
      let player = playersWithBids(ctx)[0];

      return ctx.bids[player];
    },
  });
}

function hasEveryoneSubmittedMeld() {
  return false;
}

function hasBlind(ctx: Context) {
  return ctx.hasBlind;
}

export const statechart: MachineConfig<Context, Schema, Event> = {
  id: 'game',
  initial: 'idle',
  context: {
    hasBlind: false,
    currentPlayer: '1',
    players: [],
    // trump: '',
    // bid: null,
    // playerWhoTookTheBid: null,
    isForfeiting: false,
    bids: {},
    melds: {},
  },
  states: {
    idle: {
      on: {
        START: {
          actions: [
            assign({
              players: (_, event: StartEvent) => event.players,
            }),
          ],
          target: 'bidding',
        },
      },
    },
    bidding: {
      on: {
        BID: [
          {
            target: '#game.bidding',
            actions: [bid, nextBiddingPlayer],
          },
        ],

        PASS: [
          {
            cond: isBiddingOver,
            target: '#game.won-bid',
          },
          {
            target: '#game.bidding',
            actions: [passBid, nextBiddingPlayer],
          },
        ],
      },
    },
    'won-bid': {
      id: 'winBid',
      initial: 'pending-acceptance',
      entry: ['setBidWinnerInfo', 'giveBlind'],
      states: {
        'pending-acceptance': {
          on: {
            ACCEPT: {
              target: '#wonBid.accepted',
            },
            FORFEIT: {
              target: '#game.declare-meld',
              actions: [assign<Context>({ isForfeiting: () => true })],
            },
          },
        },
        accepted: {
          on: {
            DECLARE_TRUMP: [
              {
                cond: hasBlind,
                actions: setTrump,
                target: '#winBid.discard',
              },
              {
                target: '#game.declare-meld',
                actions: setTrump,
              },
            ],
          },
        },
        discard: {
          on: {
            FINISHED: '#game.declare-meld',
          },
        },
      },
    },

    'declare-meld': {
      on: {
        SUBMIT_MELD: [
          {
            cond: hasEveryoneSubmittedMeld,
            target: '#game.phase-trick-taking',
          },
          { target: '#game.declare-meld' },
        ],
      },
    },
    'phase-trick-taking': {
      entry: ['storePreviousTrick', 'newTrick', 'determineFirstPlayer'],
      states: {
        'pending-play': {
          on: {
            PLAY_CARD: 'evaluate-play',
          },
        },
        'evaluate-play': {
          on: {
            TRICK_CONTINUES: { actions: 'nextPlayer', target: 'pending-play' },
            TRICK_ENDS: [
              {
                cond: 'isGameOver',
                target: '#game.end-game',
              },
              { target: '#game.phase-trick-taking' },
            ],
          },
        },
      },
    },
    'end-game': {},
  },
};
