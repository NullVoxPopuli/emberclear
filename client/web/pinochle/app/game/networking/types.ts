import type { Card, Suit } from '../card';
import type { GamePhase } from './constants';

export type GuestPlayer = {
  id: string;
  name: string;
  publicKeyAsHex: string;
  publicKey: Uint8Array;
  isOnline: boolean;
};

export type SerializablePlayer = {
  name: string;
  id: string;
  isOnline: boolean;
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

export type GameState = {
  info: GameInfo;
  gamePhase: GamePhase;
  currentPlayer: string;
  // Players are not aware of other player's hands
  hand: Card[];
  scoreHistory: GameResult[];
  // ... etc
};

export type GameFull = { type: 'GAME_FULL' };
export type Present = { type: 'PRESENT' };
export type NotRecognized = { type: 'NOT_RECOGNIZED' };
export type RequestState = { type: 'REQUEST_STATE' };

export type Start = { type: 'START' } & GameState;
export type UpdateForGuest = { type: 'GUEST_UPDATE' } & GameState;

export type PlayCard = { type: 'PLAY_CARD'; id: string };
export type Bid = { type: 'BID'; bid: number };
export type DeclareTrump = { type: 'DECLARE_TRUMP'; trump: Suit };
export type DeclareMeld = { type: 'DECLARE_MELD'; meld: unknown };

export type Ping = { type: 'PING' };
export type Pong = { type: 'PONG' };
export type Heartbeat = { type: 'HEARTBEAT' };
export type Play = { type: 'PLAY' };
export type Join = { type: 'JOIN'; name: string };

export type FromHostMessage = Ping | Pong | Start | GameFull | NotRecognized;

export type FromGuestMessage = Ping | Pong | Heartbeat | Play | Join;

export type GameMessage = FromHostMessage | FromGuestMessage;
