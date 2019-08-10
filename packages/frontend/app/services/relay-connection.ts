import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { Channel, Socket } from 'phoenix';
import { task } from 'ember-concurrency';

import CurrentUserService from 'emberclear/services/current-user/service';

import MessageProcessor from 'emberclear/services/messages/processor';
import MessageDispatcher from 'emberclear/services/messages/dispatcher';
import Relay from 'emberclear/src/data/models/relay';

import { toHex } from 'emberclear/src/utils/string-encoding';
import { ConnectionError, RelayNotSetError } from 'emberclear/src/utils/errors';
import Task from 'ember-concurrency/task';

interface ISendPayload {
  to: string;
  message: string;
}

async function ignoreTaskCancellation(fn: any) {
  try {
    await fn();
  } catch (e) {
    if (e.name === 'TaskCancelation') {
      // ignore
    } else {
      throw e;
    }
  }
}

// TODO: need a test for trying to send a message when not connected.
//       There are errors in the console, and I don't know if those
//       are informational or serious
// Official phoenix js docs: https://hexdocs.pm/phoenix/js/
export default class RelayConnection extends Service {
  @service('messages/processor') processor!: MessageProcessor;
  @service('messages/dispatcher') dispatcher!: MessageDispatcher;
  @service('notifications') toast!: Toast;
  @service('intl') intl!: Intl;
  @service currentUser!: CurrentUserService;

  relay?: Relay;
  socket?: Socket;
  channel?: Channel;
  channelName?: string;
  status?: string;
  statusLevel?: string;

  connected = false;

  setRelay(relay: Relay) {
    this.set('relay', relay);
  }

  getRelay() {
    if (!this.relay) {
      throw new RelayNotSetError();
    }

    return this.relay;
  }

  async send(to: string, data: string) {
    const payload: ISendPayload = { to, message: data };

    ignoreTaskCancellation(() => this.ensureConnectionToChannel.perform());

    if (!this.channel) {
      return console.error(this.intl.t('connection.errors.send.notConnected'));
    }

    return new Promise((resolve, reject) => {
      this.channel!.push('chat', payload)
        .receive('ok', resolve)
        .receive('error', reject)
        .receive('timeout', () => reject({ reason: this.intl.t('models.message.errors.timeout') }));
    });
  }

  // TODO: ensure not already connected
  async canConnect(): Promise<boolean> {
    return await this.currentUser.exists();
  }

  userChannelId(): string {
    const publicKey = this.currentUser.publicKey;

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
  async connect() {
    this.establishConnection.perform();
  }

  @(task(function*(this: RelayConnection) {
    const canConnect = yield this.canConnect();
    if (!canConnect || this.connected) return;

    this.updateStatus('info', this.intl.t('connection.connecting'));

    const publicKey = this.userChannelId();
    const url = this.getRelay().socket;

    const socket = new Socket(url, { params: { uid: publicKey } });

    this.set('socket', socket);
    this.set('channelName', `user:${publicKey}`);

    socket.onError(this.onSocketError);
    socket.onClose(this.onSocketClose);
    socket.connect();

    yield this.ensureConnectionToChannel.perform();
  }).drop())
  establishConnection!: Task;

  @(task(function*(this: RelayConnection) {
    const { t } = this.intl;

    if (this.channel) return;
    if (!this.socket) throw new ConnectionError(t('connection.errors.subscribe.notConnected'));
    if (!this.channelName) throw new ConnectionError(t('No Channel Name Specified'));

    yield this.setupChannel();
  }).drop())
  ensureConnectionToChannel!: Task;

  private async setupChannel() {
    return new Promise((resolve, reject) => {
      const channel = this.socket!.channel(this.channelName!, {});

      this.set('channel', channel);

      channel.onError(this.onChannelError);
      channel.onClose(this.onChannelClose);
      channel.on('chat', this.handleMessage);

      channel
        .join()
        .receive('ok', () => {
          ignoreTaskCancellation(() => this.handleConnected.perform());

          resolve(channel);
        })
        .receive('error', reject)
        .receive('timeout', () => console.info(this.intl.t('connection.status.timeout')));
    });
  }

  onSocketError = () => {
    this.updateStatus('error', this.intl.t('connection.status.socket.error'));
  };

  onSocketClose = () => {
    this.updateStatus('info', this.intl.t('connection.status.socket.close'));

    this.set('connected', false);
  };

  onChannelError = () => {
    console.log('channel errored');
    if (this.socket) this.socket.disconnect();
  };

  onChannelClose = () => {
    console.log('channel closed');
    if (this.socket) this.socket.disconnect();
  };

  @(task(function*(this: RelayConnection) {
    this.set('connected', true);
    this.updateStatus('info', this.intl.t('connection.connected'));

    // ping for user statuses
    yield this.dispatcher.pingAll();
  }).drop())
  handleConnected!: Task;

  handleMessage = (data: RelayMessage) => {
    this.processor.receive(data);
  };

  updateStatus = (level: string, msg: string) => {
    this.set('status', msg);
    this.set('statusLevel', level);
  };
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'relay-connection': RelayConnection;
  }
}
