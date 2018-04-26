const namespace = 'relay-connection'

export const STATE_CHANGE = `${namespace}/STATE_CHANGE`;

export enum ConnectionStatus {
  SocketDisconnected,
  SocketConnected,
  SocketClosed,
  SocketError,
  ChannelError,
  ChannelClosed,
  ChannelConnected,
  ChannelReceived
}

type RelayConnectionState = {
  connectionStatus: ConnectionStatus,
  lastMessage: string
}

type StateChange = {
  type: string,
  status: ConnectionStatus,
  message: string
}

export const stateChange =
  (status: ConnectionStatus, message: string): StateChange =>
    ({type: STATE_CHANGE, message, status});


const initialState: RelayConnectionState = {
  connectionStatus: ConnectionStatus.SocketDisconnected,
  lastMessage: ''
}

const actionHandlers = {
  [STATE_CHANGE]: (_state: RelayConnectionState, action: StateChange) => ({
    connectionStatus: action.status,
    lastMessage: action.message
  }),
}

type ActionTypes =
  | StateChange

export default function reducer(state = initialState, action: ActionTypes) {
  const handler = actionHandlers[action.type];

  return handler ? handler(state, action) : state;
}
