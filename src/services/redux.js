import ReduxService from 'ember-redux/services/redux';
import { createStore, applyMiddleware, compose } from 'redux';

import {
  reducers, enhancers,
  listOfMiddleware, setupMiddleware
} from 'emberclear/redux-store/index';

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

export default ReduxService.extend({
  reducers,
  enhancers,
  makeStoreInstance
});
