import Service, { inject as service } from '@ember/service';

// import { UnknownMessageError } from 'pinochle/../../addons/networking/addon/errors';
// import type GuestDispatcher from './dispatcher';
import type RouterService from '@ember/routing/router-service';
// import type { EncryptedMessage } from 'pinochle/../../addons/crypto/addon/types';
// import type { GameGuest } from 'pinochle/game/networking/guest';
// import type { GameMessage } from 'pinochle/game/networking/types';

export default class GuestMessageHandler extends Service {
  @service declare router: RouterService;
  // @service declare dispat'ffcher: GuestDispatcher;

  // async onData(connection: GameGuest, data: EncryptedMessage) {
  //   let decrypted: GameMessage = await connection.crypto.decryptFromSocket(data);

  //   switch (decrypted.type) {
  //     case 'ACK':
  //       connection.hostExists.resolve();
  //       connection.gameId = data.uid;

  //       return;
  //     case 'WELCOME':
  //       connection.updatePlayers(decrypted);
  //       connection.isWelcomed.resolve();

  //       return;

  //     case 'START':
  //       connection.startGame(decrypted);

  //       return;
  //     case 'GAME_FULL':
  //       this.router.transitionTo('/game-full');

  //       return;
  //     case 'GUEST_UPDATE':
  //       connection.updateGameState(decrypted);

  //       return;
  //     default:
  //       console.debug(data, decrypted);
  //       throw new UnknownMessageError();
  //   }
  // }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'guest/handler': GuestMessageHandler;
  }
}
