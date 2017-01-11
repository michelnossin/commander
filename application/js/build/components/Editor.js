'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Line = require('./Line');

var _Line2 = _interopRequireDefault(_Line);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
//import ReactDOM from 'react-dom';


var socket = (0, _socket2.default)('http://localhost'); //our server 192.168.0.105
var bgColors = { "Default": "#81b71a",
  "Blue": "#00B1E1",
  "Cyan": "#37BC9B",
  "Green": "#8CC152",
  "Red": "#E9573F",
  "Yellow": "#F6BB42"
};

//let user = "user_" + Math.random().toString(36).substring(7); //Lets give the user a name, todo: let the user make this up
//console.log("Client is using this name: " + user  );

var Editor = function (_React$Component) {
  _inherits(Editor, _React$Component);

  function Editor(props) {
    _classCallCheck(this, Editor);

    var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

    _this.state = {
      //event_msg: {}, //message from server
      //lines : []  //list of all non current lines
    };

    //this.sendMessage = this.sendMessage.bind(this)

    //receive event from server
    socket.on('serverevent', function (ev_msg) {
      if (ev_msg.type == 'servermessage') {}
      //Some user send a text message.
      //this.receiveMessage(ev_msg.message)

      //Init client based on server properties as determined
      else if (ev_msg.type == 'serverHandshake') {
          //this.resetClient()
          console.log("Server handshake received by client");
        }
    });
    return _this;
  }

  //shouldComponentUpdate(nextProps, nextState) {
  //  return false;
  //}

  //Call when windows resized.
  /*
  updateDimensions() {
        let orgWidth = this.state.width
        let orgHeight = this.state.height
        console.log("Width and Height resize to " + String(window.innerWidth) + " and " + String(window.innerHeight)  );
        let newWidth = window.innerWidth
        let newHeight = window.innerHeight
        //this.setState( { width :window.innerWidth, height: window.innerHeight })
          var positions = Object.assign({},this.state.position)
          Object.keys(positions).map((player,index) => {
          positions[player].x1 = (newWidth/orgWidth) * positions[player].x1
          positions[player].x2 = (newWidth/orgWidth) * positions[player].x2
          positions[player].y1 = (newHeight/orgHeight) * positions[player].y1
          positions[player].y2 = (newHeight/orgHeight) * positions[player].y2
        })
          this.setState( { position: positions , width :window.innerWidth, height: window.innerHeight})
    }
  */

  //client set timer, at this moment only used to simulate key events


  _createClass(Editor, [{
    key: 'componentDidMount',
    value: function componentDidMount() {

      var self = this;
      socket.on('connect', function (data) {
        console.log("Client was connected using socket id " + String(socket.id));
        //socket.emit('clientmessage', { type: "userHandshake", user: user })
      });
      socket.on('disconnect', function () {
        console.log("Client was disconnected  " + String(socket.id));
      });
      window.addEventListener("resize", this.updateDimensions);
    }

    //remove any timers and listeners when client stops

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      console.log("Client with was disconnected ");
      window.removeEventListener("resize", this.updateDimensions);
    }

    //Send event message to server, for example to let others know we change our line direction

  }, {
    key: 'sendMessage',
    value: function sendMessage(message) {
      socket.emit('clientmessage', message);
    }
  }, {
    key: 'render',
    value: function render() {
      var username = "";

      return _react2.default.createElement(
        'div',
        { className: 'Editor' },
        _react2.default.createElement(
          'button',
          { type: 'button' },
          'Click Me!'
        )
      );
      /*
          return (
            <div className="Lineio" >
            { Object.keys(this.state.position).map((username,index) => (
            <Line key={index}
            from={{x: this.state.position[username].x1, y: this.state.position[username].y1}}
            to={{x: this.state.position[username].x2, y: this.state.position[username].y2}} style={this.state.position[username].styling}/>
          ))}
             <footer>{this.state.event_msg.message}</footer>
             </div>
          );
      */
    }
  }]);

  return Editor;
}(_react2.default.Component);

Editor.propTypes = {
  //url: React.PropTypes.string,  //Not yet used, at some point backend will be added
};

Editor.defaultProps = {
  //url: "http://localhost:3000/pandaweb/all",
};

exports.default = Editor;