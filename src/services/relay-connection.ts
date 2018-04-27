import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { translationMacro as t } from "ember-i18n";


import { Socket } from 'phoenix-socket';

import { stateChange, ConnectionStatus } from '../redux-store/relay-connection';

const DEFAULT_RELAYS = {
  0: { url: 'wss://mesh-relay-in-us-1.herokuapp.com/socket' },
  1: { url: 'wss://mesh-relay-in-us-2.herokuapp.com/socket' },
  2: { url: 'ws://localhost:4301/socket' },
  3: { url: '' }
};

export default class RelayConnection extends Service.extend({
  toast: service('toast'),
  redux: service('redux'),
  i18n: service('i18n'),

  socket: null,
  channel: null,

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
  send(to, data) {
    const payload = { to, message: data };

    if (!this.channel) {
      return this.toast.error(t('connection.errors.send.notConnected'));
    }

    return this.channel
      .push('chat', payload)
      .receive("ok", (msg) => console.log(t('connection.log.push.ok', { msg })) )
      .receive("error", (reasons) => console.log(t('connection.log.push.error', { reasons })) )
      .receive("timeout", () => console.log(t('connection.log.push.timeout')) )
  },

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
    this.toast.info(t('connection.connecting'));

    const publicKey = '';
    const url = DEFAULT_RELAYS[0].url;

    const socket = new Socket(url, { params: { uid: publicKey } });
    this.socket = socket;

    socket.onError(() => {
      this.redux.dispatch(stateChange(ConnectionStatus.SocketError, ''))
      this.toast.error(t('connection.status.socket.error'));
    });
    socket.onClose(() => {
      this.redux.dispatch(stateChange(ConnectionStatus.SocketClosed, ''))
      this.toast.info(t('connection.status.socket.close'));
    });

    // establish initial connection to the server
    socket.connect();

    this.subscribeToChannel(`user:${publicKey}`);


  },

  subscribeToChannel(channelName) {
    if (!this.socket) {
      return this.toast(t('connection.errors.subscribe.notConnected'));
    }

    // subscribe and hook up things.
    const channel = this.socket.channel(channelName, {});
    this.channel = channel;

    channel.onError(() => {
      this.redux.dispatch(stateChange(ConnectionStatus.ChannelError, ''))

      this.socket.disconnect();
    });

    channel.onClose(() => {
      this.redux.dispatch(stateChange(ConnectionStatus.ChannelClosed, ''))

      this.socket.disconnect();
    });

    channel.on('chat', this.handleMessage);

    channel
      .join()
      .receive('ok', this.handleConnected)
      .receive('error', this.handleError)
      .receive("timeout", () => this.toast.info(t('connection.status.timeout')) );

  },

  handleError(data) {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelError, data))

    console.error(data);
  },

  handleConnected() {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelConnected, ''))
  },

  handleMessage(data) {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelReceived, data))

    // process the message and do something with it
    // pass it off to a message processing service
  }
}) {

}

declare module '@ember/service' {
  interface Registry {
    'relay-connection': RelayConnection
  }
}
