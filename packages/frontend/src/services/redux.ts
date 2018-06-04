import ReduxService from 'ember-redux/services/redux';
import { createStore, applyMiddleware, compose } from 'redux';

import {
  reducers, enhancers,
  listOfMiddleware, setupMiddleware
} from '../redux-store';

// called by the internal ReduxService
const makeStoreInstance = ({ reducers, enhancers }) => {
  const middleware = applyMiddleware(...listOfMiddleware);

  const createStoreWithMiddleware = compose(
    middleware,
    enhancers
  )(createStore);

  const store = createStoreWithMiddleware(reducers);
  setupMiddleware(store);

  return store;
};

export default class Redux extends ReduxService.extend({
  reducers,
  enhancers,
  makeStoreInstance
}) {
  // TODO: figure out real types.....
  [x: string]: any;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'redux': Redux
  }
}
