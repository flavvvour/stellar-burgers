import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import store from './services/store';
import AppInitializer from './components/app/app-initializer';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <Provider store={store}>
    <Router>
      <DndProvider backend={HTML5Backend}>
        <AppInitializer />
      </DndProvider>
    </Router>
  </Provider>
);
