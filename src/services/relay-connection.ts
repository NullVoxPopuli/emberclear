import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { assert } from '@ember/debug';

import { Socket } from 'phoenix-socket';

import { stateChange, ConnectionStatus } from 'emberclear/redux-store/relay-connection';

const DEFAULT_RELAYS = {
  0: { url: 'wss://mesh-relay-in-us-1.herokuapp.com/socket' },
  1: { url: 'wss://mesh-relay-in-us-2.herokuapp.com/socket' },
  2: { url: 'ws://localhost:4301/socket' },
  3: { url: '' }
};

export default class RelayConnection extends Service.extend({
  // anything which *must* be merged to prototype here
}) {
  toast = service('toast');
  redux = service('redux');
  socket = null;
  channel = null;

  // TODO: add support for sending along a specific channel / chat-room
  // TODO: consider chatroom implementation with server, or keeping it all
  //       filtered on the frontend, as it has been in previous implementations
  //
  //       Pros of Client-Side Channels
  //       - server implementation is simple
  //       - server-side channels could potentially have lots more channels on the server
  //         - this could burn through resources quicker, especially on free tier IaaS
  //
  //       Cons of Client Side Channels
  //       - more complicated logic for a problem that already been solved
  //
  send(to: string, data: string) {
    const payload = { to, message: data };

    assert(
      'this.channel must be connected before sending messages',
      this.channel != null
    )

    return this.channel
      .push('chat', payload)
      .receive("ok", (msg: string) => console.log("created message", msg) )
      .receive("error", (reasons: any) => console.log("create failed", reasons) )
      .receive("timeout", () => console.log("Networking issue...") )
  }

  // each user has at least one channel that they subscribe to
  // this is for direct messages
  // subsequent rooms may be subscribed to, and are denoted by
  // :roomname at the end of the channel.
  //
  // user channel: user:<publicKey>
  // room channel: room:<roomName>,user:<publicKey,
  //
  // this format is because every sent message must be
  // individually encrypted and sent to specific channels
  //
  // TODO: investigate capabilities of the phoenix websocket server
  //       if a message can be broadcast to a specific user on
  //       a channel, then we don't need a room-channel per user.
  //       this would greatly reduce the number of channels needed
  //       for chat rooms
  connect() {
    const publicKey = '';
    const url = DEFAULT_RELAYS[0].url;

    const socket = new Socket(url, { params: { uid: publicKey } });
    this.socket = socket;

    socket.onError(() => {
      this.redux.dispatch(stateChange(ConnectionStatus.SocketError, ''))
      this.toast.error('An error occurred in the socket connection!');
    });
    socket.onClose(() => {
      this.redux.dispatch(stateChange(ConnectionStatus.SocketClosed, ''))
      this.toast.info('The socket connection has been dropped!');
    });

    // establish initial connection to the server
    socket.connect();

    this.subscribeToChannel(`user:${publicKey}`);


  }

  subscribeToChannel(channelName: string) {
    assert('socket must be connected', this.socket != null);

    // subscribe and hook up things.
    const channel = this.socket.channel(channelName, {});
    this.channel = channel;

    channel.onError(() => {
      this.redux.dispatch(stateChange(ConnectionStatus.ChannelError, ''))

      console.info('channel: there was an error!');
      this.socket.disconnect();
    });

    channel.onClose(() => {
      this.redux.dispatch(stateChange(ConnectionStatus.ChannelClosed, ''))

      console.info('channel: channel has gone away gracefully')
      this.socket.disconnect();
    });

    channel.on('chat', this.handleMessage);

    channel
      .join()
      .receive('ok', this.handleConnected)
      .receive('error', this.handleError)
      .receive("timeout", () => console.log("Networking issue. Still waiting...") );

  }

  handleError(data: string) {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelError, data))

    console.error(data);
  }

  handleConnected() {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelConnected, ''))
  }

  handleMessage(data: string) {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelReceived, data))

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
