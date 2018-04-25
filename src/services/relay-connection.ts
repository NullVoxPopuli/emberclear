import Service from '@ember/service';
import { inject as service } from '@ember/service';

import { Socket } from 'phoenix-socket';


const DEFAULT_RELAYS = {
  0: { url: 'wss://mesh-relay-in-us-1.herokuapp.com/socket' },
  1: { url: 'wss://mesh-relay-in-us-2.herokuapp.com/socket' },
  2: { url: 'ws://localhost:4301/socket' },
  3: { url: '' }
};


// TODO: use redux for handling socket state?
//       overkill?
//       -- maybe not. history of connection status would be handy
export default class RelayConnection extends Service.extend({
  // anything which *must* be merged to prototype here
}) {
  toast = service('toast');
  socket = null;
  channel = null;

  send(to: string, data: string) {
    const payload = { to, message: data };

    return this.channel.push('chat', payload);
  }

  connect() {
    const publicKey = '';
    const url = DEFAULT_RELAYS[0].url;

    const socket = new Socket(url, { params: { uid: publicKey } });
    this.socket = socket;

    socket.onError(() => this.toast.error('An error occurred in the socket connection!'));
    socket.onClose(() => this.toast.info('The socket connection has been dropped!'));

    // establish initial connection to the server
    socket.connect();

    // subscribe and hook up things.
    const channel = socket.channel(`user:${publicKey}`, {});
    this.channel = channel;

    channel.onError(() => {
      console.info('channel: there was an error!');
      socket.disconnect();
    });

    channel.onClose(() => {
      console.info('channel: channel has gone away gracefully')
      socket.disconnect();
    });

    channel.on('chat', this.handleMessage);

    channel
      .join()
      .receive('ok', this.handleConnected)
      .receive('error', this.handleError);


  }

  handleError(data) {
    console.error(data);
  }

  handleConnected() {
    // woo!?
  }

  handleMessage(data) {
    // process the message and do something with it
    // pass it off to a message processing service
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'relay-connection': RelayConnection;
  }
}
