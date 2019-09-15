// min-connections are met
export const STATUS_CONNECTED = 'connected';
// min-connections are not met
export const STATUS_DEGRADED = 'degraded';
// there are no connections
export const STATUS_DISCONNECTED = 'disconnected';

// hopefully this is never used
export const STATUS_UNKNOWN = 'unknown';

export type STATUS =
  | typeof STATUS_CONNECTED
  | typeof STATUS_DEGRADED
  | typeof STATUS_DISCONNECTED
  | typeof STATUS_UNKNOWN;

export interface PoolConfig<Connectable, EndpointInfo> {
  // send: <Args extends Array<any>>(instance, ...args: Args) => Promise<void>;

  // Available URLs / whatever that will be randomly selected when creating
  // a new connection
  endpoints: EndpointInfo[];

  // How to create and destroy instances
  // isOk is watched to know whether or not new
  // instances need to be made
  create: (endpoint: EndpointInfo) => Connectable | Promise<Connectable>;
  destroy: (instance: Connectable) => void | Promise<void>;
  isOk: (instance: Connectable) => boolean;

  // hooks
  onStatusChange: (status: STATUS) => void;

  // Min and Max number of instances to make
  minConnections?: number;
  maxConnections?: number;
}

/**
 * A pool is responsible for:
 * - creating new connections
 * - disposing of connections
 *
 * A pool is not responsible for:
 * - how to connect
 * - how to dispose
 * - receiving/sending messages
 *
 *
 * @param [PoolConfig] config;
 *
 */
export async function pool<Connectable, EndpointInfo>(
  config: PoolConfig<Connectable, EndpointInfo>
): Promise<ConnectionPool<Connectable, EndpointInfo>> {
  let connectionPool = new ConnectionPool<Connectable, EndpointInfo>(config);

  await connectionPool.hydrate();

  return connectionPool;
}

export class ConnectionPool<Connectable, EndpointInfo> {
  private config: PoolConfig<Connectable, EndpointInfo>;

  private connections: Connectable[] = [];

  constructor(config: PoolConfig<Connectable, EndpointInfo>) {
    this.config = config;
  }

  get activeConnections() {
    return this.connections.filter(this.config.isOk);
  }

  get status(): STATUS {
    let count = this.activeConnections.length;

    if (count === 0) {
      return STATUS_DISCONNECTED;
    } else if (count < this.minConnections) {
      return STATUS_DEGRADED;
    } else if (count >= this.minConnections) {
      return STATUS_CONNECTED;
    }

    return STATUS_UNKNOWN;
  }

  get minConnections() {
    return this.config.minConnections || 1;
  }

  get minimumMet() {
    return this.activeConnections.length >= this.minConnections;
  }

  // TODO: implement logic for selecting the "best" connection
  async acquire(): Promise<Connectable> {
    await this.hydrate();

    let psuedoBestIndex = Math.floor(Math.random() * this.activeConnections.length);

    return this.activeConnections[psuedoBestIndex];
  }

  // TODO: we need a way to monitor status changes within
  //       a connection
  async hydrate(): Promise<void> {
    if (this.minimumMet) return;

    this.notifyOfStatusChange();

    for (let i = 0; i < this.minConnections; i++) {
      let endpoint = this.nextEndpoint();

      let connection = await this.config.create(endpoint);

      this.connections.push(connection);
      this.notifyOfStatusChange();
    }
  }

  drain() {
    this.activeConnections.forEach(this.config.destroy);
  }

  private notifyOfStatusChange() {
    if (!this.config.onStatusChange) {
      return;
    }

    this.config.onStatusChange(this.status);
  }

  private nextEndpoint(): EndpointInfo {
    return this.config.endpoints[0];
  }
}
