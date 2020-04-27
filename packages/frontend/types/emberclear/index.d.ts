import Ember from 'ember';

declare global {
  type KeyPublic = { publicKey: Uint8Array };
  type KeyPrivate = { privateKey: Uint8Array };
  type KeyPair = KeyPublic & KeyPrivate;

  type SigningKeyPublic = { publicSigningKey: Uint8Array };
  type SigningKeyPrivate = { privateSigningKey: Uint8Array };
  type SigningKeyPair = SigningKeyPublic & SigningKeyPrivate;

  interface Prism {
    highlightAll: () => void;
  }

  interface IDecoratorArgs extends Array<any | string | PropertyDescriptor> {
    0: any;
    1: string;
    2: PropertyDescriptor;
  }

  interface Router {
    currentURL: string;
  }

  interface IdentityJson {
    name: string;
    publicKey: string;
  }

  interface PublicIdentity {
    id: string;
    name: string;
  }

  interface RelayStateJson {
    relay: { [key: string]: string };
    ['connection_count']: number;
    ['connected_relays']: number;
    ['connected_to_relays']: object;
  }

  interface RelayState {
    relay: { [key: string]: string };
    connectionCount?: number;
    connectedRelays?: number;
    connectedToRelays?: object;
  }

  interface OpenGraphData {
    audio?: string;
    ['audio:secure_url']?: string;
    ['audio:type']?: string;
    description?: string;
    determiner?: string;
    image?: string;
    ['image:alt']?: string;
    ['image:height']?: string;
    ['image:secure_url']?: string;
    ['image:width']?: string;
    locale?: string;
    site_name?: string;
    title?: string;
    type?: string;
    url?: string;
    video?: string;
    ['video:alt']?: string;
    ['video:height']?: string;
    ['video:secure_url']?: string;
    ['video:type']?: string;
    ['video:width']?: string;
  }

  interface RelayOpenGraphResponse {
    data: OpenGraphData;
  }

  interface Window {
    devToolsExtension: any;
  }

  interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {}
  // interface Function extends Ember.FunctionPrototypeExtensions {}

  // https://github.com/knownasilya/ember-toastr/blob/master/addon/services/toast.js
  interface Toast {
    [method: string]: (message: string, title?: string, options?: any) => void;
    success(message: string, title?: string, options?: any): void;
    info(message: string, title?: string, options?: any): void;
    warning(message: string, title?: string, options?: any): void;
    error(message: string, title?: string, options?: any): void;
  }

  // https://github.com/jamesarosen/ember-i18n/blob/master/addon/services/i18n.js
  interface Intl {
    t(translation: string, options?: any): string;
  }

  interface RelayMessage {
    uid: string;
    message: string;
  }

  interface ChannelMember {
    id: string;
    name: string;
  }

  interface MemberResult {
    id: string;
    result: boolean;
    time: string;
  }

  interface ChannelInvitation {
    invitePublicKey: string;
    result: MemberResult[];
  }

  interface ChannelBlock {
    blockedPublicKey: string;
    result: MemberResult[];
  }

  interface StandardMessage {
    id: string;
    to: string;
    type: string;
    target: string;
    client: string;
    client_version: string;
    time_sent: Date;
    sender: {
      name: string;
      uid: string;
      location: string;
    };
    message: {
      body: string;
      contentType: string;
    };
    channelInfo?: {
      name: string;
      members: ChannelMember[];
      pendingInvitations: ChannelInvitation[];
      blocked: ChannelBlock[];
    };
  }

  type LoginSYN = { type: 'SYN'; data: PublicIdentity };
  type LoginACK = { type: 'ACK' };
  type LoginHash = { type: 'HASH'; data: string };
  type LoginData = {
    type: 'DATA';
    hash: string;
    data: {
      version: number;
      name: string;
      privateKey: string;
      privateSigningKey?: string;
      contacts: { name: string; publicKey: string }[];
      channels: { id: string; name: string }[];
    };
  };

  type LoginMessage = LoginData | LoginACK | LoginSYN | LoginHash;

  type RelayJson = StandardMessage | LoginMessage;
}

//
// // https://github.com/typed-ember/ember-cli-typescript/issues/197#issuecomment-384645960
// declare module '@ember/debug' {
//   declare function assert<T extends boolean>(desc: string, test?: T): T extends true ? void : never;
// }

declare module '@ember/service' {
  interface Registry {
    toast: Toast;
    intl: Intl;
  }
}
