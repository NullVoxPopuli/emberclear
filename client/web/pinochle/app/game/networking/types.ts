import type { Card, Suit } from '../card';
import type { GamePhase } from './constants';

export type GuestPlayer = {
  name: string;
  publicKeyAsHex: string;
  publicKey: Uint8Array;
};

export type SerializablePlayer = {
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

export type GameState = {
  info: GameInfo;
  gamePhase: GamePhase;
  currentPlayer: string;
  // Players are not aware of other player's hands
  hand: Card[];
  scoreHistory: GameResult[];
  // ... etc
};

export type JoinMessage = { type: 'JOIN'; name: string };
export type Syn = { type: 'SYN' };
export type NotRecognized = { type: 'NOT_RECOGNIZED' };
export type RequestState = { type: 'REQUEST_STATE' };
export type Start = { type: 'START' } & GameState;
export type Ack = { type: 'ACK' };
export type WelcomeMessage = { type: 'WELCOME'; players: SerializablePlayer[] };
export type UpdateForGuest = { type: 'GUEST_UPDATE' } & GameState;
export type GameFull = { type: 'GAME_FULL' };

type FromHostMessage = Ack | WelcomeMessage | UpdateForGuest | Start | GameFull | NotRecognized;
type FromGuestMessage = JoinMessage | Syn | RequestState;

export type GameMessage = FromHostMessage | FromGuestMessage;
