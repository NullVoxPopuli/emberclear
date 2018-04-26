// This project does not need sagas, as
// redux will not be used for storing network-originating data
// (and ember-concurrency is more ergonomic)


// import createSagaMiddleWare from 'redux-saga';

// const createSaga = createSagaMiddleWare.default ?
//   createSagaMiddleWare.default :
//   createSagaMiddleWare;

// const sagaMiddleware = createSaga();

export const setup = (store) => {
  // sagaMiddleware.run(addAsync);
};

export const middleware =  [
  // sagaMiddleware
]
