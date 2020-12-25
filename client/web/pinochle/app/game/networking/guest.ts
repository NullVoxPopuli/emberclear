import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import RSVP from 'rsvp';

import { fromHex } from '@emberclear/encoding/string';
import { EphemeralConnection } from '@emberclear/networking';
import { UnknownMessageError } from '@emberclear/networking/errors';

import type { Card } from '../card';
import type { GameMessage, GuestPlayer, Start, WelcomeMessage } from './types';
import type { EncryptedMessage } from '@emberclear/crypto/types';

/**
 * TODO:
 * - given a hex / public key as hex, connect to a host
 * - receive turn order
 * - receive hands
 * - handle when the host says a new game should happen
 *
 */
export class GameGuest extends EphemeralConnection {
  hostExists = RSVP.defer();
  isWelcomed = RSVP.defer();
  isStarted = RSVP.defer();

  @tracked gameId?: string;
  @tracked players: GuestPlayer[] = [];
  @tracked hand: Card[] = [];

  @action
  async checkHost() {
    await this.send({ type: 'SYN' });

    return this.hostExists.promise;
  }

  @action
  async joinHost(name: string) {
    await this.send({ type: 'JOIN', name });

    return this.isWelcomed.promise;
  }

  @action
  waitForStart() {
    return this.isStarted.promise;
  }

  @action
  async onData(data: EncryptedMessage) {
    let decrypted: GameMessage = await this.crypto.decryptFromSocket(data);

    switch (decrypted.type) {
      case 'ACK':
        this.hostExists.resolve();
        this.gameId = data.uid;

        return;
      case 'WELCOME':
        this.updatePlayers(decrypted);
        this.isWelcomed.resolve();

        return;

      case 'START':
        this.startGame(decrypted);

        return;
      default:
        console.debug(data, decrypted);
        throw new UnknownMessageError();
    }
  }

  @action
  updatePlayers(msg: WelcomeMessage) {
    this.players = msg.players.map(({ name, id }) => {
      return {
        name,
        publicKeyAsHex: id,
        publicKey: fromHex(id),
      };
    });
  }

  @action
  startGame({ hand }: Start) {
    this.hand = hand;

    this.isStarted.resolve();
  }
}
