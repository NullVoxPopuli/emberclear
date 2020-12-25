import type { Card, Suit } from '../card';
import type { GamePhase } from './constants';

export type GuestPlayer = {
  name: string;
  publicKeyAsHex: string;
  publicKey: Uint8Array;
};

type SerializablePlayer = {
  name: string;
  id: string;
};

export type GameInfo = {
  trump: Suit;
  bid: number;
  playerWhoTookTheBid: string;
  playerOrder: string[];
  players: SerializablePlayer[];
};

export type GameResult = {
  info: GameInfo;
  players: {
    [playerId: string]: {
      // TODO: have card values and specific history?
      meld: number;
      tricks: number;
      lastTrick: boolean;
      // including last trick
      pointsFromTricks: number;
    };
  };
};

export type JoinMessage = { type: 'JOIN'; name: string };
export type Syn = { type: 'SYN' };
export type Start = { type: 'START'; hand: Card[] };
export type Ack = { type: 'ACK' };
export type WelcomeMessage = { type: 'WELCOME'; players: SerializablePlayer[] };
export type UpdateForGuest = {
  type: 'GUEST_UPDATE';
  info: GameInfo;
  gamePhase: GamePhase;
  currentPlayer: string;
  // Players are not aware of other player's hands
  hand: Card[];
  scoreHistory: GameResult[];
  // ... etc
};
export type GameFull = { type: 'GAME_FULL' };

export type GameMessage = JoinMessage | WelcomeMessage | Start | Ack | Syn | UpdateForGuest;
