'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _Editor = require('./components/Editor');

var _Editor2 = _interopRequireDefault(_Editor);

var _Toolbar = require('./components/Toolbar');

var _Toolbar2 = _interopRequireDefault(_Toolbar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MyApp = _react2.default.createClass({
  displayName: 'MyApp',
  handleClick: function handleClick(e) {
    console.log("Clicked in element1");

    if (_reactDom2.default.findDOMNode(this).contains(e.target)) {
      console.log("Clicked in element2");
      return;
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    document.removeEventListener('click', this.handleClick, false);
  },

  //Set current window size before starting
  componentWillMount: function componentWillMount() {
    document.addEventListener('click', this.handleClick, false);
  },
  render: function render() {
    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(_Toolbar2.default, null),
      _react2.default.createElement(_Editor2.default, null)
    );
  }
});

_reactDom2.default.render(_react2.default.createElement(MyApp, null), document.getElementById('app'));