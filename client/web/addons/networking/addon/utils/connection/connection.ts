import { Socket } from 'phoenix';

import type { EncryptedMessage } from '@emberclear/crypto/types';
import type { EndpointInfo, RelayState, RelayStateJson } from '@emberclear/networking/types';
import type { Channel } from 'phoenix';

export const NAME = Symbol('__PHOENIX_SOCKET__');

// Side-effect bad.
// Need a better way to mock this rather than just
// changing what this is assigned to.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any)[NAME] = (window as any)[NAME] || Socket;

interface Args {
  relay: EndpointInfo;
  publicKey: string;
  onData: (data: EncryptedMessage) => void;
  onInfo: (data: RelayState) => void;
}

export interface OutgoingPayload {
  to: string;
  message: string;
}

function phoenixSocket(): typeof Socket {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)[NAME];
}

export class Connection {
  declare relay: EndpointInfo;
  declare url: string;
  declare publicKey: string;
  declare channelName: string;
  declare onData: (data: EncryptedMessage) => void;
  declare onInfo: (data: RelayState) => void;

  isConnected = false;
  isConnecting = false;

  private declare socket?: Socket;
  private declare channel?: Channel;

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
      let Klass = phoenixSocket();

      this.isConnecting = true;

      this.socket = new Klass(this.url, {
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
          resolve(undefined);
        })
        .receive('error', reject);
    });
  }

  private async setupChatChannel() {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject();

      this.channel = this.socket.channel(this.channelName, {});

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
        .receive('timeout', (...args: unknown[]) => {
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
