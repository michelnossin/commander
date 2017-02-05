'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';

//Our main application with have a toolbar and editor window
let MyApp = React.createClass({
    render() {
      return(
        <div>
        <Toolbar />
        <Editor />
        </div>
      )
    }
});

ReactDOM.render(
  <MyApp/>,
  document.getElementById('app')
);
