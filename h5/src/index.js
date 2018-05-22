import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import store from "./Store";
import {HashRouter as TheRouter} from "react-router-dom";
import {Provider} from "react-redux";

ReactDOM.render(<Provider store={store}>
  <TheRouter>
    <App/>
  </TheRouter>
</Provider>, document.getElementById('root'));
registerServiceWorker();
