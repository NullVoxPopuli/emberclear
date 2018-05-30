import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { Channel, Socket } from 'phoenix';

import Redux from 'emberclear/services/redux';
import IdentityService from 'emberclear/services/identity/service';
import { toBase64, toHex } from 'emberclear/src/utils/string-encoding';

import { stateChange, ConnectionStatus } from '../redux-store/relay-connection';

const DEFAULT_RELAYS = {
  0: { url: 'wss://mesh-relay-in-us-1.herokuapp.com/socket' },
  1: { url: 'wss://mesh-relay-in-us-2.herokuapp.com/socket' },
  2: { url: 'ws://localhost:4301/socket' },
  3: { url: '' }
};

// Official phoenix js docs: https://hexdocs.pm/phoenix/js/
export default class RelayConnection extends Service {
  @service('notifications') toast!: Toast;
  @service('redux') redux!: Redux;
  @service intl!: Intl;
  @service identity!: IdentityService;

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
      return console.error(this.intl.t('connection.errors.send.notConnected'));
    }

    return channel
      .push('chat', payload)
      .receive("ok", (msg: string) => toast.info(this.intl.t('connection.log.push.ok', { msg })) )
      .receive("error", (reasons: any) => toast.error(this.intl.t('connection.log.push.error', { reasons })) )
      .receive("timeout", () => toast.info(this.intl.t('connection.log.push.timeout')) )
  }

  // TODO: ensure not already connected
  async canConnect(this: RelayConnection): Promise<boolean> {
    return await this.identity.exists();
  }

  userChannelId(): string {
    const publicKey = this.identity.publicKey;

    if (!publicKey) return '';

    return toHex(publicKey);
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
  async connect(this: RelayConnection) {
    const canConnect = await this.canConnect();
    if (!canConnect) return;

    this.toast.info(this.intl.t('connection.connecting'));

    const publicKey = this.userChannelId();
    const url = DEFAULT_RELAYS[0].url;

    const socket = new Socket(url, { params: { uid: publicKey } });
    this.set('socket', socket);

    socket.onError(this.onSocketError);
    socket.onClose(this.onSocketClose);

    // establish initial connection to the server
    socket.connect();
    this.subscribeToChannel(`user:${publicKey}`);
  }

  subscribeToChannel(this: RelayConnection, channelName: string) {
    const { socket, toast } = this;

    if (!socket) {
      return toast.error(this.intl.t('connection.errors.subscribe.notConnected'));
    }

    // subscribe and hook up things.
    const channel = socket.channel(channelName, {});
    this.set('channel', channel);

    channel.onError(this.onChannelError);
    channel.onClose(this.onChannelClose);
    channel.on('chat', this.handleMessage);

    channel
      .join()
      .receive('ok', this.handleConnected)
      .receive('error', this.handleError)
      .receive("timeout", () => console.info(this.intl.t('connection.status.timeout')) );

  }

  onSocketError = () => {
    this.toast.error(this.intl.t('connection.status.socket.error'));
    this.redux.dispatch(stateChange(ConnectionStatus.SocketError, ''));
  }

  onSocketClose = () => {
    this.toast.info(this.intl.t('connection.status.socket.close'));
    this.redux.dispatch(stateChange(ConnectionStatus.SocketClosed, ''));
  }


  onChannelError = () => {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelError, ''))

    if (this.socket) this.socket.disconnect();
  }

  onChannelClose = () => {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelClosed, ''))

    if (this.socket) this.socket.disconnect();
  }

  handleError(this: RelayConnection, data: string) {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelError, data))

    console.error(data);
  }

  handleConnected(this: RelayConnection, ) {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelConnected, ''))
  }

  handleMessage(this: RelayConnection, data: string) {
    this.redux.dispatch(stateChange(ConnectionStatus.ChannelReceived, data))

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
