'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';

ReactDOM.render(
  <div>
  <Toolbar />
  <Editor />
  </div>,
  document.getElementById('app')
);
