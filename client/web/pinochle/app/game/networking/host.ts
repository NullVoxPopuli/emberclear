import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

import { fromHex } from '@emberclear/encoding/string';
import { EphemeralConnection } from '@emberclear/networking';
import { UnknownMessageError } from '@emberclear/networking/errors';

import type { EncryptedMessage } from '@emberclear/crypto/types';

type JoinMessage = { type: 'JOIN'; name: string; hexId: string };
type GameMessage = JoinMessage;

type GuestPlayer = {
  name: string;
  publicKeyAsHex: string;
  publicKey: Uint8Array;
};

/**
 * TODO:
 *  - track number of people connected
 *  - put those people in an order, with option to shuffle (us included)
 *  - implement card communication
 *  - add the ability to restart a game at any time
 *    - useful for the home rule of too many 9s
 */
export class GameHost extends EphemeralConnection {
  @tracked players: GuestPlayer[] = [];

  get numConnected() {
    return this.players.length;
  }

  get joinUrl() {
    let { origin } = window.location;

    return `${origin}/join/${this.hexId}`;
  }

  @action
  async onData(data: EncryptedMessage) {
    let decrypted: GameMessage = await this.crypto.decryptFromSocket(data);

    switch (decrypted.type) {
      case 'JOIN':
        this._addPlayer(decrypted);

        return;
      default:
        throw new UnknownMessageError();
    }
  }

  @action
  _addPlayer(data: JoinMessage) {
    this.players.push({
      publicKeyAsHex: data.hexId,
      name: data.name,
      publicKey: fromHex(data.hexId),
    });
  }
}
