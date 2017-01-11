'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Editor from './components/Editor';
import Toolbar from './components/Toolbar';

//Our main application with have a toolbar and editor window
let MyApp = React.createClass({
  handleClick  (e) {

      if (ReactDOM.findDOMNode(this).contains(e.target)) {
          //clicked existing object
          return;
      }
      else {
        //New object
      }
  },
  componentWillUnmount () {
        document.removeEventListener('click', this.handleClick, false);
  },
  //We will listen to mouse clicks globally to see if we have to add new objects
  //in the editor
  componentWillMount  () {
        document.addEventListener('click', this.handleClick, false);
    },

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
