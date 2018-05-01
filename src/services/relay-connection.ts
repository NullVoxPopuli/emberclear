import Service from '@ember/service';
import { translationMacro as t } from "ember-i18n";

import { service } from '@ember-decorators/service';

import { Channel, Socket } from 'phoenix';

import { stateChange, ConnectionStatus } from '../redux-store/relay-connection';

const DEFAULT_RELAYS = {
  0: { url: 'wss://mesh-relay-in-us-1.herokuapp.com/socket' },
  1: { url: 'wss://mesh-relay-in-us-2.herokuapp.com/socket' },
  2: { url: 'ws://localhost:4301/socket' },
  3: { url: '' }
};

export default class RelayConnection extends Service {
  // @service('toast') toast;
  @service('redux') redux;
  // @service('i18n') i18n;

  socket?: Socket;
  channel?: Channel;

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
  send(this: RelayConnection, to: string, data: string) {
    const payload = { to, message: data };
    const channel = this.get('channel');
    const toast = this.get('toast');

    if (!channel) {
      return console.error(t('connection.errors.send.notConnected'));
    }

    return channel
      .push('chat', payload)
      .receive("ok", (msg: string) => toast.info(t('connection.log.push.ok', { msg })) )
      .receive("error", (reasons: any) => toast.error(t('connection.log.push.error', { reasons })) )
      .receive("timeout", () => toast.info(t('connection.log.push.timeout')) )
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
  connect(this: RelayConnection) {
    const toast = this.get('toast');
    // toast.info('hi');
    const redux = this.get('redux');

    console.info(t('connection.connecting'));

    const publicKey = '';
    const url = DEFAULT_RELAYS[0].url;

    const socket = new Socket(url, { params: { uid: publicKey } });
    this.set('socket', socket);

    socket.onError(() => {
      toast.error(t('connection.status.socket.error'));
      redux.dispatch(stateChange(ConnectionStatus.SocketError, ''))
    });
    socket.onClose(() => {
      toast.info(t('connection.status.socket.close'));
      redux.dispatch(stateChange(ConnectionStatus.SocketClosed, ''))
    });

    // establish initial connection to the server
    // socket.connect();
    //
    // this.subscribeToChannel(`user:${publicKey}`);


  }

  subscribeToChannel(this: RelayConnection, channelName: string) {
    const socket = this.get('socket');
    const redux = this.get('redux');
    // const toast = this.get('toast');

    if (!socket) {
      return toast.error(t('connection.errors.subscribe.notConnected'));
    }

    // subscribe and hook up things.
    const channel = socket.channel(channelName, {});
    this.set('channel', channel);

    channel.onError(() => {
      redux.dispatch(stateChange(ConnectionStatus.ChannelError, ''))

      socket.disconnect();
    });

    channel.onClose(() => {
      redux.dispatch(stateChange(ConnectionStatus.ChannelClosed, ''))

      socket.disconnect();
    });

    channel.on('chat', this.handleMessage);

    channel
      .join()
      .receive('ok', this.handleConnected)
      .receive('error', this.handleError)
      .receive("timeout", () => console.info(t('connection.status.timeout')) );

  }

  handleError(this: RelayConnection, data: string) {
    const redux = this.get('redux');

    redux.dispatch(stateChange(ConnectionStatus.ChannelError, data))

    console.error(data);
  }

  handleConnected(this: RelayConnection, ) {
    const redux = this.get('redux');

    redux.dispatch(stateChange(ConnectionStatus.ChannelConnected, ''))
  }

  handleMessage(this: RelayConnection, data: string) {
    const redux = this.get('redux');

    redux.dispatch(stateChange(ConnectionStatus.ChannelReceived, data))

    // process the message and do something with it
    // pass it off to a message processing service
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'relay-connection': RelayConnection
  }
}
