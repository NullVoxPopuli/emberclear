import { combineReducers, Reducer } from 'redux';

import { reducers as relayConnection, State as RelayState } from './relay-connection';

export interface State {
  relayConnection: RelayState
}

export const reducers: Reducer<State> = combineReducers({
  relayConnection
});
