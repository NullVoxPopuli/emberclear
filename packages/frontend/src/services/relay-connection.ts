import RSVP from 'rsvp';
import Service from '@ember/service';
import { service } from '@ember-decorators/service';
import { Channel, Socket } from 'phoenix';
// import { task } from 'ember-concurrency-decorators';
import { task } from 'ember-concurrency';

import IdentityService from 'emberclear/services/identity/service';
import MessageProcessor from 'emberclear/services/messages/processor';
import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import RelayManager from 'emberclear/services/relay-manager';

import { toHex } from 'emberclear/src/utils/string-encoding';

interface ISendPayload {
  to: string;
  message: String;
}

// Official phoenix js docs: https://hexdocs.pm/phoenix/js/
export default class RelayConnection extends Service {
  @service('messages/processor') processor!: MessageProcessor;
  @service('messages/dispatcher') dispatcher!: MessageDispatcher;
  @service('notifications') toast!: Toast;
  @service('intl') intl!: Intl;
  @service relayManager!: RelayManager;
  @service identity!: IdentityService;

  socket?: Socket;
  channel?: Channel;
  channelName?: string;
  status?: string;
  statusLevel?: string;

  connected = false;

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
  async send(this: RelayConnection, to: string, data: string) {
    const payload: ISendPayload = { to, message: data };
    const channel = await this.getChannel();

    if (!channel) {
      return console.error(this.intl.t('connection.errors.send.notConnected'));
    }

    return new Promise((resolve, reject) => {
      channel
        .push('chat', payload)
        .receive("ok", resolve)
        .receive("error", reject)
        .receive("timeout",
          () => reject({ reason: this.intl.t('models.message.errors.timeout') }));
    });
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
    this.get('establishConnection').perform();
  }

  // @task
  // * establishConnection(this: RelayConnection) {
  establishConnection = task(function*(this: RelayConnection) {
    const canConnect = yield this.canConnect();
    if (!canConnect || this.connected) return;

    this.updateStatus('info', this.intl.t('connection.connecting'));

    const publicKey = this.userChannelId();
    const url = this.relayManager.getRelay().socket;

    const socket = new Socket(url, { params: { uid: publicKey } });

    this.set('socket', socket);
    this.set('channelName', `user:${publicKey}`)

    socket.onError(this.onSocketError);
    socket.onClose(this.onSocketClose);

    // establish initial connection to the server
    socket.connect();

    yield this.getChannel();
  // }
  });

  async getChannel(this: RelayConnection): Promise<Channel> {
    const { socket, channelName, intl } = this;

    const promise: Promise<Channel> = new RSVP.Promise((resolve, reject) => {
      if (this.channel) {
        return resolve(this.channel);
      }

      if (!socket) {
        return reject(intl.t('connection.errors.subscribe.notConnected'));
      }

      if (!channelName) {
        return reject('No Channel Name Specified');
      }

      const channel = socket.channel(channelName, {});

      this.set('channel', channel);

      channel.onError(this.onChannelError);
      channel.onClose(this.onChannelClose);
      channel.on('chat', this.handleMessage);

      channel
        .join()
        .receive('ok', () => {
          this.set('connected', true);

          this.handleConnected();

          resolve(channel);
        })
        .receive('error', this.handleError)
        .receive("timeout", () => console.info(this.intl.t('connection.status.timeout')) );
    });

    return promise;
  }

  onSocketError = () => {
    this.updateStatus('error', this.intl.t('connection.status.socket.error'));
  }

  onSocketClose = () => {
    this.updateStatus('info', this.intl.t('connection.status.socket.close'));

    this.set('connected', false);
  }


  onChannelError = () => {
    console.log('channel errored');
    if (this.socket) this.socket.disconnect();
  }

  onChannelClose = () => {
    console.log('channel closed');
    if (this.socket) this.socket.disconnect();
  }

  handleError = (data: string) => {
    console.error(data);
  }

  handleConnected = () => {
    this.updateStatus('info', this.intl.t('connection.connected'));

    // ping for user statuses
    this.dispatcher.pingAll();
  }

  handleMessage = (data: RelayMessage) => {
    this.processor.receive(data);
  }

  updateStatus = (level: string, msg: string) => {
    this.set('status', msg);
    this.set('statusLevel', level);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'relay-connection': RelayConnection
  }
}
