export type GuestPlayer = {
  name: string;
  publicKeyAsHex: string;
  publicKey: Uint8Array;
};

type SerializablePlayer = {
  name: string;
  id: string;
};

export type JoinMessage = { type: 'JOIN'; name: string };
export type Syn = { type: 'SYN' };
export type Start = { type: 'START' };
export type Ack = { type: 'ACK' };
export type WelcomeMessage = { type: 'WELCOME'; players: SerializablePlayer[] };
export type GameFull = { type: 'GAME_FULL' };

export type GameMessage = JoinMessage | WelcomeMessage | Start | Ack | Syn;
