'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Toolbar = require('react-simple-toolbar');
var Region = Toolbar.Region;
var bgColors = { "Default": "#81b71a",
  "Blue": "#00B1E1",
  "Cyan": "#37BC9B",
  "Green": "#8CC152",
  "Red": "#E9573F",
  "Yellow": "#F6BB42"
};

var MyBar = function (_React$Component) {
  _inherits(MyBar, _React$Component);

  function MyBar(props) {
    _classCallCheck(this, MyBar);

    var _this = _possibleConstructorReturn(this, (MyBar.__proto__ || Object.getPrototypeOf(MyBar)).call(this, props));

    _this.state = {
      mode: ""
    };

    _this.clickBtn = _this.clickBtn.bind(_this);

    _this.playBtn = _this.playBtn.bind(_this);
    _this.dbBtn = _this.dbBtn.bind(_this);
    _this.sinkBtn = _this.sinkBtn.bind(_this);
    _this.connectBtn = _this.connectBtn.bind(_this);

    return _this;
  }

  //Click Toolbar button event lsnr


  _createClass(MyBar, [{
    key: 'clickBtn',
    value: function clickBtn(e) {

      var mode = e.target.id;
      console.log("CLICKED " + mode);
      this.setState({ mode: mode });
    }
  }, {
    key: 'playBtn',
    value: function playBtn() {
      if (this.state.mode == "toolbar-play-img") return _react2.default.createElement(
        'button',
        { style: { border: "5px" }, id: 'toolbar-play-btn' },
        _react2.default.createElement('img', { id: 'toolbar-play-img', src: '/images/play.png', alt: 'Play, run this flow ongoing', onClick: this.clickBtn, width: '32', height: '23' })
      );else return _react2.default.createElement(
        'button',
        { id: 'toolbar-play-btn' },
        _react2.default.createElement('img', { id: 'toolbar-play-img', src: '/images/play.png', alt: 'Play, run this flow ongoing', onClick: this.clickBtn, width: '32', height: '23' })
      );
    }
  }, {
    key: 'dbBtn',
    value: function dbBtn() {
      if (this.state.mode == "toolbar-db-img") return _react2.default.createElement(
        'button',
        { style: { border: "5px" }, id: 'toolbar-db-btn' },
        _react2.default.createElement('img', { id: 'toolbar-db-img', src: '/images/db.png', alt: 'Database, data source', onClick: this.clickBtn, width: '32', height: '23' })
      );else return _react2.default.createElement(
        'button',
        { id: 'toolbar-db-btn' },
        _react2.default.createElement('img', { id: 'toolbar-db-img', src: '/images/db.png', alt: 'Database, data source', onClick: this.clickBtn, width: '32', height: '23' })
      );
    }
  }, {
    key: 'sinkBtn',
    value: function sinkBtn() {
      if (this.state.mode == "toolbar-sink-img") return _react2.default.createElement(
        'button',
        { style: { border: "5px" }, id: 'toolbar-sink-btn' },
        _react2.default.createElement('img', { id: 'toolbar-sink-img', src: '/images/sink.png', alt: 'Sink, data target', onClick: this.clickBtn, width: '32', height: '23' })
      );else return _react2.default.createElement(
        'button',
        { id: 'toolbar-sink-btn' },
        _react2.default.createElement('img', { id: 'toolbar-sink-img', src: '/images/sink.png', alt: 'Sink, data target', onClick: this.clickBtn, width: '32', height: '23' })
      );
    }
  }, {
    key: 'connectBtn',
    value: function connectBtn() {
      if (this.state.mode == "toolbar-connect-img") return _react2.default.createElement(
        'button',
        { style: { border: "5px" }, id: 'toolbar-connect-btn' },
        _react2.default.createElement('img', { id: 'toolbar-connect-img', src: '/images/connect.png', alt: 'Connect, conncecting sources and sinks', onClick: this.clickBtn, width: '32', height: '23' })
      );else return _react2.default.createElement(
        'button',
        { id: 'toolbar-connect-btn' },
        _react2.default.createElement('img', { id: 'toolbar-connect-img', src: '/images/connect.png', alt: 'Connect, conncecting sources and sinks', onClick: this.clickBtn, width: '32', height: '23' })
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'Toolbar' },
        _react2.default.createElement(
          Toolbar,
          null,
          _react2.default.createElement(
            Region,
            { id: 'toolbar' },
            this.playBtn(),
            this.dbBtn(),
            this.sinkBtn(),
            this.connectBtn()
          )
        )
      );
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      document.body.style.margin = "0px";
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      document.body.style.margin = null;
    }
  }]);

  return MyBar;
}(_react2.default.Component);

MyBar.propTypes = {
  //url: React.PropTypes.string,  //Not yet used, at some point backend will be added
};

MyBar.defaultProps = {
  //url: "http://localhost:3000/pandaweb/all",
};

exports.default = MyBar;