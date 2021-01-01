/* eslint-disable @typescript-eslint/no-explicit-any */
import { later } from '@ember/runloop';

import { NAME } from '@emberclear/networking/utils/connection/connection';

import type { Socket } from 'phoenix';

type Callback = (...args: unknown[]) => void;

/**
 * Somewhat re-implements the relay behavior
 */
export function setupSocketServer(hooks: NestedHooks) {
  let oldSocket: Socket;
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

              later(
                null,
                (_users, _pushHandler) => {
                  if (!_users[to]) {
                    return _pushHandler._receive?.error('user not found');
                  }

                  _users[to]._handle['chat'](message);

                  _pushHandler._receive?.ok();
                },
                users,
                pushHandler,
                10
              );
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
              later(null, callback, 10);

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

      if (channelName.startsWith('user')) {
        let [, id] = channelName.split(':');

        users[id] = channel;
      }

      return channel;
    },
  };

  hooks.beforeEach(function () {
    oldSocket = (window as any)[NAME];

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
