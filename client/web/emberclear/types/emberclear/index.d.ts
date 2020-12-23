import type Ember from 'ember';
import '@ember/component';
import '@ember/test-helpers';
import 'ember-cli-htmlbars';
import 'qunit';

import 'ember-concurrency-decorators';
import 'ember-concurrency-async';
import 'ember-concurrency-ts/async';

import './addon-services.d';
import './addon-augmentations.d';

declare global {
  type EmptyRecord = Record<string, unknown>;

  interface Prism {
    highlightAll: () => void;
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
    ['connected_to_relays']: Record<string, unknown>;
  }

  interface RelayState {
    relay: { [key: string]: string };
    connectionCount?: number;
    connectedRelays?: number;
    connectedToRelays?: Record<string, unknown>;
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

  interface Array<T> extends Ember.ArrayPrototypeExtensions<T> {
    /* this enables ember-data arrays to have .toArray() and such */
    _____fake: unknown;
  }
  // interface Function extends Ember.FunctionPrototypeExtensions {}

  interface UserIdentifier {
    uid: string;
  }

  interface NamedUser {
    uid: string;
    name: string;
  }

  interface RelayMessage {
    uid: string;
    message: string;
  }

  interface ChannelMember {
    id: string;
    name: string;
    signingKey: string; // This is the public signing key
  }

  interface MemberResult {
    id: string;
    result: boolean;
    time: string;
  }

  interface StandardVoteChain {
    id: string;
    remaining: ChannelMember[];
    yes: ChannelMember[];
    no: ChannelMember[];
    target: ChannelMember;
    action: string;
    key: ChannelMember;
    previousVoteChain?: StandardVoteChain;
    signature: string;
  }

  interface StandardVote {
    id: string;
    voteChain: StandardVoteChain;
  }

  interface StandardChannelContextChain {
    id: string;
    admin: ChannelMember;
    members: ChannelMember[];
    supportingVote?: StandardVoteChain;
    previousChain?: StandardChannelContextChain;
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
      metadata?: Record<string, unknown>;
    };
    channelInfo?: {
      uid: string;
      name: string;
      activeVotes: StandardVote[];
      contextChain: StandardChannelContextChain;
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
