export default {
  appname: 'emberclear',

  connection: {
    connecting: 'Connecting...',

    log: {
      push: {
        ok: 'push: created. {{msg}}',
        error: 'push: message failed. {{reasons}}',
        timeout: 'push: Networking issue'
      }
    },

    status: {
      socket: {
        error: 'An error occurred in the socket connection!',
        close: 'The socket connection has been dropped!'
      },
      timeout: 'There is a networking issue. waiting...'
    },

    errors: {
      send: {
        notConnected: 'Cannot send messages without a connection!'
      },
      subscribe: {
        notConnected: 'Cannot subscribe to a channel without a socket connection!'
      }
    }
  }
}
