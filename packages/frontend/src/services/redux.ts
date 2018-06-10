import ReduxService from 'ember-redux/services/redux';
import {
  createStore, applyMiddleware, compose,
  GenericStoreEnhancer, Reducer
} from 'redux';

import {
  reducers, enhancers,
  listOfMiddleware, setupMiddleware, State
} from '../redux-store';


interface MakeStoreParams {
  reducers: Reducer<State>;
  enhancers: GenericStoreEnhancer;
}

// called by the internal ReduxService
const makeStoreInstance = (props: MakeStoreParams) => {
  const { reducers, enhancers } = props;

  const storeComposer = compose(
    // sagas, maybe thunks, etc:
    applyMiddleware(...listOfMiddleware),
    // e.g.: dev tools
    enhancers
  ) as GenericStoreEnhancer;

  const createStoreWithMiddleware = storeComposer(createStore);

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
