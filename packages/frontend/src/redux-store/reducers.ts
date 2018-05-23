import { combineReducers } from 'redux';

import { reducers as relayConnection } from './relay-connection';

export const reducers = combineReducers({
  relayConnection
});
