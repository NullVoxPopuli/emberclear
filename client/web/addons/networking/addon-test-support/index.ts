/* eslint-disable @typescript-eslint/no-explicit-any */
import { isDestroyed, isDestroying } from '@ember/destroyable';
import { later, schedule } from '@ember/runloop';

import { NAME } from '@emberclear/networking/utils/connection/connection';

import type ApplicationInstance from '@ember/application/instance';
import type { Socket } from 'phoenix';

type Callback = (...args: unknown[]) => void;

/**
 * Somewhat re-implements the relay behavior
 *
 * See: @emberclear/networking/utils/connection/connection.ts
 */
export function setupSocketServer(hooks: NestedHooks) {
  let oldSocket: Socket;
  let owner: ApplicationInstance | undefined;
  let users: Record<string, ReturnType<typeof fakeServer['channel']>> = {};

  function FakeSocket(_url: string, _opts: Options) {
    return fakeServer;
  }

  const fakeServer: any = {
    onOpen: (fn: any) => (fakeServer._onOpen = fn),
    onError: () => {
      /* not needed */
    },
    onClose: () => {
      /* not needed */
    },

    connect: () => fakeServer._onOpen(),
    disconnect: () => {
      /* eh */
    },
    channel(channelName: string) {
      let id = '';

      if (channelName.startsWith('user')) {
        let [, _id] = channelName.split(':');

        id = _id;
      }

      const channel = {
        _handle: {} as Record<string, Callback>,

        push(kind: string, payload: any) {
          const pushHandler = {
            _receive: {} as Record<string, Callback>,

            /**
             * @public
             */
            receive(kind: string, callback: Callback) {
              pushHandler._receive[kind] = callback;

              return pushHandler;
            },
          };

          switch (kind) {
            case 'chat': {
              let { to, message } = payload;

              // use runloop to hold up tests until this finishes
              schedule('afterRender', () => {
                if (!owner || isDestroyed(owner) || isDestroying(owner)) return;

                if (!users[to]) {
                  console.info({ users, payload, callback: pushHandler._receive?.error });

                  return pushHandler._receive?.error('user not found');
                }

                users[to]._handle['chat']({ uid: id, message });

                pushHandler._receive?.ok?.();
              });
              break;
            }

            default:
              console.debug('unknown push', { channelName, msg: kind, payload });
          }

          return pushHandler;
        },
        join() {
          return channel;
        },

        receive(kind: string, callback: () => void) {
          switch (kind) {
            // on channel join
            case 'ok':
              requestAnimationFrame(callback);

              return channel;
            case 'error':
              // no tests of errors so far
              return channel;
            case 'timeout':
              // no tests of timeouts so far
              return channel;
            default:
              later(
                null,
                () => {
                  console.debug('unnamed receive', { msg: kind });

                  callback();
                },
                10
              );
          }

          return channel;
        },

        on<T>(msgType: string, callback: (data: T) => void) {
          channel._handle[msgType] = callback;
        },
        leave() {
          /* not needed */
        },
        onClose() {
          /* not needed */
        },
        onError() {
          /* not needed */
        },
      };

      if (id) {
        users[id] = channel;
      }

      return channel;
    },
  };

  hooks.beforeEach(function () {
    users = {};
    oldSocket = (window as any)[NAME];
    owner = this.owner;

    (window as any)[NAME] = FakeSocket;
  });

  hooks.afterEach(function () {
    (window as any)[NAME] = oldSocket;
  });
}

type Options = {
  params: { uid: string };
};

// export function mockSocketServer(url?: string) {
//   const fakeURL = url || `wss://${defaultRelays[0].host}/`;
//   const mockServer = new Server(fakeURL);

//   mockServer.on('connection', (socket) => {
//     console.log('connect', { socket, mockServer });
//     socket.on('message', (data) => {
//       console.log({ data, socket, mockServer });
//       socket.send('test message from mock server');
//     });
//   });

//   return mockServer;
// }
