export interface P2PMessage {
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
}

export interface RelayStateJson {
  relay: { [key: string]: string };
  ['connection_count']: number;
  ['connected_relays']: number;
  ['connected_to_relays']: Record<string, unknown>;
}

export interface RelayState {
  relay: { [key: string]: string };
  connectionCount?: number;
  connectedRelays?: number;
  connectedToRelays?: Record<string, unknown>;
}

export interface OpenGraphData {
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

export interface RelayOpenGraphResponse {
  data: OpenGraphData;
}
