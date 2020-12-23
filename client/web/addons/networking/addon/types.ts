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
