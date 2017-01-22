'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _Line = require('./Line');

var _Line2 = _interopRequireDefault(_Line);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var socket = (0, _socket2.default)('http://localhost'); //our server 192.168.0.105
var bgColors = { "Default": "#81b71a",
  "Blue": "#00B1E1",
  "Cyan": "#37BC9B",
  "Green": "#8CC152",
  "Red": "#E9573F",
  "Yellow": "#F6BB42",
  "White": "#FFFFFF",
  "Black": "#000000"

};

//let user = "user_" + Math.random().toString(36).substring(7); //Lets give the user a name, todo: let the user make this up
//console.log("Client is using this name: " + user  );

//The editor is the yellow editor field in which the user will add objects and connections.

var Editor = function (_React$Component) {
  _inherits(Editor, _React$Component);

  function Editor(props) {
    _classCallCheck(this, Editor);

    var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

    _this.state = {
      mode: "", //Which toolbar button is pressed determines the mode (like play , source etc)
      objects: [], //list of all objects drawn in the editor
      connections: [], //list of all connections (lines) between the objects
      drawingline: 0 //set to 1 while use is drawing a line, used by mousemove event
    };

    //this.sendMessage = this.sendMessage.bind(this)
    _this.addObject = _this.addObject.bind(_this); //Add object like source or sink in editor
    _this.addConnection = _this.addConnection.bind(_this); //Add connection/line between two objects
    _this.selectObject = _this.selectObject.bind(_this); //select existing object or connection
    _this.handleMouseUp = _this.handleMouseUp.bind(_this); //mouse up event handler, used to add objects
    _this.handleMouseDown = _this.handleMouseDown.bind(_this); //mouse down event used to add connection (so moving mouse will make it larger)
    _this.handleMouseMove = _this.handleMouseMove.bind(_this); //Used to draw connections
    _this.isLastConnectionValid = _this.isLastConnectionValid.bind(_this); //Is connection between two objects and thus valid
    _this.correctLastConnection = _this.correctLastConnection.bind(_this); //If its valid make sure its connected at predetermined postions
    _this.correctConnection = _this.correctConnection.bind(_this); //correct any connection, so it fits nicely between two objects
    _this.removeLastConnection = _this.removeLastConnection.bind(_this); //If connection is not valid remove it

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

  //Mouse is moved


  _createClass(Editor, [{
    key: 'handleMouseMove',
    value: function handleMouseMove(e) {
      if (this.state.drawingline == 1) {
        //Use is drawing line, make line larger
        var stateCopy = Object.assign({}, this.state);
        var lastLine = stateCopy.connections[stateCopy.connections.length - 1];
        lastLine.x2 = e.clientX;
        lastLine.y2 = e.clientY;
        this.setState(stateCopy);
      }
    }
    //Mouse is clicked

  }, {
    key: 'handleMouseDown',
    value: function handleMouseDown(e) {
      //Users wants to draw a connect Line,
      if (this.state.mode == "connect" && e.target.id == "") {
        this.addConnection(e.clientX, e.clientY);
      }
    }
    //Mouse is clicked

  }, {
    key: 'handleMouseUp',
    value: function handleMouseUp(e) {
      //Stop drawing line if we'r drawing
      if (this.state.drawingline == 1) {
        this.setState({ drawingline: 0 });
        if (this.isLastConnectionValid() == 1) this.correctLastConnection();else this.removeLastConnection();

        //return
      }
      //Toolbar click ignore
      if (e.target.id == "toolbar") return;
      //Toolbar button changes mode
      else if (e.target.id != "") {
          //"toolbar-play-img"
          if (e.target.id == "toolbar-play-img" || e.target.id == "toolbar-play-btn") this.setState({ mode: "play" });else if (e.target.id == "toolbar-db-img" || e.target.id == "toolbar-db-btn") this.setState({ mode: "db" });else if (e.target.id == "toolbar-sink-img" || e.target.id == "toolbar-sink-btn") this.setState({ mode: "sink" });else if (e.target.id == "toolbar-connect-img" || e.target.id == "toolbar-connect-btn") this.setState({ mode: "connect" });
          return;
        }
        //Click in editor add object, except if mode is play which just means the editor is playing, or empty
        else {
            if (this.state.mode != "play" && this.state.mode != "" && this.state.mode != "connect") this.addObject(e.clientX, e.clientY);
          }
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      var self = this;
      document.addEventListener('mouseup', self.handleMouseUp, false); //click
      document.addEventListener('mousedown', self.handleMouseDown, false);
      document.addEventListener('mousemove', self.handleMouseMove, false);
    }

    //Is last connection between two objects valid? 0 = No , 1 = Yes

  }, {
    key: 'isLastConnectionValid',
    value: function isLastConnectionValid() {
      var stateCopy = Object.assign({}, this.state);
      var lastLine = stateCopy.connections[stateCopy.connections.length - 1];
      var startPointCorrect = 0;
      var endPointCorrect = 0;

      //Is startpoint last line on an existing object?
      this.state.objects.map(function (obj, index) {
        //Is start point of line in an object?
        if (lastLine.x1 > obj.x - 25 && lastLine.x1 < obj.x + 25 && lastLine.y1 > obj.y - 25 && lastLine.y1 < obj.y + 25) {
          startPointCorrect = 1;
          lastLine["from"] = obj;
        }
      });
      //Is endpoint lastline on an existing object?
      this.state.objects.map(function (obj, index) {
        //Is start point of line in an object?
        if (lastLine.x2 > obj.x - 25 && lastLine.x2 < obj.x + 25 && lastLine.y2 > obj.y - 25 && lastLine.y2 < obj.y + 25) {
          endPointCorrect = 1;
          lastLine["to"] = obj;
        }
      });

      //In case both are this last line is correct
      if (startPointCorrect == 1 && endPointCorrect == 1) {
        lastLine["corner"] = "right";
        this.setState({ connections: stateCopy.connections });
        return 1;
      }
      return 0;
    }

    //correct a given connection so its fits nicely between two objects. ano object can connec in 2 ways, so switch mode also

  }, {
    key: 'correctConnection',
    value: function correctConnection(c) {
      var stateCopy = Object.assign({}, this.state);
      //var lastLine = stateCopy.connections[stateCopy.connections.length-1]
      if (c.x2 > c.x1 && c.y2 > c.y1) {
        if (c.corner == "left") {
          c.x1 = c.from.x;
          c.y1 = c.from.y + 25;
          c.x2 = c.to.x - 25;
          c.y2 = c.to.y;
        } else {
          c.x1 = c.from.x + 25;
          c.y1 = c.from.y;
          c.x2 = c.to.x;
          c.y2 = c.to.y - 25;
        }
      } else if (c.x2 > c.x1 && c.y2 < c.y1) {
        if (c.corner == "left") {
          c.x1 = c.from.x;
          c.y1 = c.from.y - 25;
          c.x2 = c.to.x - 25;
          c.y2 = c.to.y;
        } else {
          c.x1 = c.from.x + 25;
          c.y1 = c.from.y;
          c.x2 = c.to.x;
          c.y2 = c.to.y + 25;
        }
      } else if (c.x2 < c.x1 && c.y2 < c.y1) {
        if (c.corner == "right") {
          c.x1 = c.from.x - 25;
          c.y1 = c.from.y;
          c.x2 = c.to.x;
          c.y2 = c.to.y + 25;
        } else {
          c.x1 = c.from.x;
          c.y1 = c.from.y - 25;
          c.x2 = c.to.x + 25;
          c.y2 = c.to.y;
        }
      } else if (c.x2 < c.x1 && c.y2 > c.y1) {
        if (c.corner == "right") {
          c.x1 = c.from.x - 25;
          c.y1 = c.from.y;
          c.x2 = c.to.x;
          c.y2 = c.to.y - 25;
        } else {
          c.x1 = c.from.x;
          c.y1 = c.from.y + 25;
          c.x2 = c.to.x + 25;
          c.y2 = c.to.y;
        }
      }
      this.setState({ connections: stateCopy.connections });
    }
    //If last connection is correct we need to correct it so its connecting at correct positions

  }, {
    key: 'correctLastConnection',
    value: function correctLastConnection() {
      this.correctConnection(this.state.connections[this.state.connections.length - 1]);
    }

    //If last connection is not correct we will remove it

  }, {
    key: 'removeLastConnection',
    value: function removeLastConnection() {
      var stateCopy = Object.assign({}, this.state);
      stateCopy.connections.pop();
      this.setState({ connections: stateCopy.connections });
    }

    //Add object in Editor

  }, {
    key: 'addObject',
    value: function addObject(x, y) {
      this.state.objects.push({ name: "Change this", x: x, y: y, objType: this.state.mode });
      this.forceUpdate();
    }
    //Add connection between two objects

  }, {
    key: 'addConnection',
    value: function addConnection(x, y) {
      this.state.connections.push({ x1: x, y1: y, x2: x, y2: y, styling: "1px solid black", corner: "right" });
      this.setState({ drawingline: 1 });
      this.forceUpdate();
    }
  }, {
    key: 'selectObject',
    value: function selectObject() {
      return;
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

  }, {
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
      document.removeEventListener('mouseup', this.handleMouseUp, false); //click
      document.removeEventListener('mousedown', this.handleMouseUp, false);
      document.removeEventListener('mousemove', this.handleMouseMove, false);
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

      //util function Return image path based on obj type
      var imageSrc = function imageSrc(objType) {
        var result = void 0;
        switch (objType) {
          case "play":
            result = "images/play.png";
            break;
          case "db":
            result = "images/db.png";
            break;
          case "sink":
            result = "images/sink.png";
            break;
          case "connect":
            result = "images/connect.png";
            break;
        }
        return result;
      };

      //get pixel for text so we can add title on objects nicely centered
      var textWidthPixels = function textWidthPixels(txt) {
        // Create dummy span
        var x = document.createElement('span');
        // Set text
        x.innerHTML = txt;
        document.body.appendChild(x);
        // Get width NOW, since the dummy span is about to be removed from the document
        var w = x.offsetWidth;
        // Cleanup
        document.body.removeChild(x);
        // All right, we're done
        return w;
      };

      //Get triangle based on position begin and and so it directs correct
      var getTriangle = function getTriangle(x1, y1, x2, y2, corner) {
        if (corner == "right") {
          if (x2 > x1) return "images/triangle-right.png";else return "images/triangle-left.png";
        } else {
          if (y2 > y1) return "images/triangle-up.png";else return "images/triangle-down.png";
        }
      };

      return _react2.default.createElement(
        'div',
        { className: 'Editor', id: 'editor' },
        this.state.connections.map(function (obj, index) {
          return _react2.default.createElement(
            'div',
            { key: "connection_" + index },
            _react2.default.createElement(_Line2.default, { key: "connection_1_" + index,
              from: { x: obj.x1, y: obj.y1 },
              to: { x: obj.x2, y: obj.y1 }, style: obj.styling }),
            _react2.default.createElement(_Line2.default, { key: "connection_2_" + index,
              from: { x: obj.x2, y: obj.y1 },
              to: { x: obj.x2, y: obj.y2 }, style: obj.styling }),
            _react2.default.createElement('img', { key: "connection_3_" + index,
              style: { position: "absolute", top: obj.y1 - 8 + 'px', left: obj.x2 - (obj.x2 - obj.x1) / 2 + 'px' },
              src: getTriangle(obj.x1, obj.y1, obj.x2, obj.y2, obj.corner) })
          );
        }),
        this.state.objects.map(function (obj, index) {
          return _react2.default.createElement(
            'div',
            { key: "obj_" + index },
            _react2.default.createElement('img', { ondragstart: 'return false;', className: 'Editor', key: "obj_" + index, style: { position: "absolute", top: obj.y - 25 + 'px', left: obj.x - 25 + 'px',
                width: '50px', height: '50px' },
              src: imageSrc(obj.objType) }),
            _react2.default.createElement(
              'h4',
              { style: { position: "absolute", top: obj.y + 25 + 'px', left: obj.x - textWidthPixels(obj.name) / 2 + 'px' } },
              _react2.default.createElement(
                'span',
                { style: { color: bgColors.Black, backgroundColor: bgColors.White } },
                obj.name
              )
            )
          );
        })
      );
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