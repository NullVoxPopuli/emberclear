import { Channel, Socket } from 'phoenix';

import Relay from 'emberclear/models/relay';

interface Args {
  relay: Relay;
  publicKey: string;
  onData: (data: RelayMessage) => void;
  onInfo: (data: RelayState) => void;
}

export interface OutgoingPayload {
  to: string;
  message: string;
}

export class Connection {
  relay: Relay;
  url: string;
  publicKey: string;
  channelName: string;
  onData: (data: RelayMessage) => void;
  onInfo: (data: RelayState) => void;

  isConnected = false;
  isConnecting = false;

  private socket?: Socket;
  private channel?: Channel;

  /**
   * @param [Relay] relay
   * @param [string] publicKey: hex
   */
  constructor({ relay, publicKey, onData, onInfo }: Args) {
    this.relay = relay;
    this.url = relay.socket;
    this.publicKey = publicKey;
    this.channelName = `user:${publicKey}`;
    this.onData = onData;
    this.onInfo = onInfo;
  }

  async connect() {
    if (this.isConnected || this.isConnecting) return;

    await this.setupSocket();
    await this.setupChannels();
  }

  private async setupSocket() {
    return new Promise((resolve, reject) => {
      this.isConnecting = true;

      this.socket = new Socket(this.url, {
        params: { uid: this.publicKey },
      });

      this.socket.onOpen(resolve);
      this.socket.onError(reject);

      this.socket.onClose(() => {
        this.isConnected = false;
      });

      this.socket.connect();
    });
  }

  private async setupChannels() {
    await this.setupChatChannel();
    await this.setupStatsChannel();
  }

  private async setupStatsChannel() {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject();

      let channel = this.socket.channel(`stats`, {});

      channel.on('state', (data: RelayStateJson) => {
        let connectionCount = data['connection_count'];

        this.onInfo({ relay: data.relay, connectionCount });
      });

      channel
        .join()
        .receive('ok', () => {
          resolve();
        })
        .receive('error', reject);
    });
  }

  private async setupChatChannel() {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject();

      this.channel = this.socket.channel(this.channelName!, {});

      this.channel.on('chat', this.onData);

      this.channel.onError(console.error);

      this.channel.onClose(() => {
        if (this.socket) {
          this.socket.disconnect();
        }
      });

      this.channel
        .join()
        .receive('ok', () => {
          this.isConnected = true;
          this.isConnecting = false;

          resolve(this.channel);
        })
        .receive('error', reject)
        .receive('timeout', (...args: any[]) => {
          console.info('channel timed out', ...args);
        });
    });
  }

  send(payload: OutgoingPayload) {
    return new Promise((resolve, reject) => {
      if (!this.channel) {
        console.error('no channel present...');
        return reject();
      }

      this.channel
        .push('chat', payload)
        .receive('ok', resolve)
        .receive('error', reject)
        .receive('timeout', () => reject({ reason: 'timed out' }));
    });
  }

  destroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
