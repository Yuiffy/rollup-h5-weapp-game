import {applyMiddleware, combineReducers, compose, createStore} from 'redux';

import {reducer as mainReducer} from './game';
import {getInitState} from './utils/';

const win = window;

const reducer = combineReducers({
  main: mainReducer
});


const middlewares = [];
if (process.env.NODE_ENV !== 'production') {
  middlewares.push(require('redux-immutable-state-invariant').default());
}

const storeEnhancers = compose(
  applyMiddleware(...middlewares),
  (win && win.devToolsExtension) ? win.devToolsExtension() : f => f,
);

export default createStore(reducer, getInitState(), storeEnhancers);
