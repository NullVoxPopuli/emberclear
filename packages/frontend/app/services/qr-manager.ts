import Service from '@ember/service';

import { SendDataConnection } from 'emberclear/services/connection/ephemeral/login/send-data';

/**
 * NOTE: This should be a local service to the /qr route.
 *       How do we re-register / test with local services?
 */
export default class QRManager extends Service {
  login = {
    async setupConnection(context: unknown, publicKey: string) {
      let connection = await SendDataConnection.build(context, publicKey);

      await connection.establishContact();

      return connection;
    },
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'qr-manager': QRManager;
  }
}
