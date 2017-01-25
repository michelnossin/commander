'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactKeydown = require('react-keydown');

var _reactKeydown2 = _interopRequireDefault(_reactKeydown);

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
//@keydown

var Editor = function (_React$Component) {
  _inherits(Editor, _React$Component);

  function Editor(props) {
    _classCallCheck(this, Editor);

    var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

    _this.state = {
      mode: "", //Which toolbar button is pressed determines the mode (like play , source etc)
      objects: [], //list of all objects drawn in the editor
      connections: [], //list of all connections (lines) between the objects
      drawingline: 0, //set to 1 while use is drawing a line, used by mousemove event
      selectedObject: 0, //Set object reference last selected (also connections), or 0 if non
      movingObject: 0 //set to 1 if we are moving an object (non connection)
    };

    //this.sendMessage = this.sendMessage.bind(this)
    _this.addObject = _this.addObject.bind(_this); //Add object like source or sink in editor
    _this.addConnection = _this.addConnection.bind(_this); //Add connection/line between two objects
    _this.handleMouseUp = _this.handleMouseUp.bind(_this); //mouse up event handler, used to add objects
    _this.handleMouseDown = _this.handleMouseDown.bind(_this); //mouse down event used to add connection (so moving mouse will make it larger)
    _this.handleMouseMove = _this.handleMouseMove.bind(_this); //Used to draw connections
    _this.handleKeyDown = _this.handleKeyDown.bind(_this); //keydown, eg to delete objects
    _this.isLastConnectionValid = _this.isLastConnectionValid.bind(_this); //Is connection between two objects and thus valid
    _this.correctLastConnection = _this.correctLastConnection.bind(_this); //If its valid make sure its connected at predetermined postions
    _this.correctConnection = _this.correctConnection.bind(_this); //correct any connection, so it fits nicely between two objects
    _this.removeLastConnection = _this.removeLastConnection.bind(_this); //If connection is not valid remove it
    _this.selectObject = _this.selectObject.bind(_this); //Select object at given position, if any
    _this.deselectAll = _this.deselectAll.bind(_this); //deselect all objects and connections
    _this.deleteSelectedObject = _this.deleteSelectedObject.bind(_this); //delete selected object/connections or connection (after delete key press)

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

  /*
    @keydown( 'enter' ) // or specify `which` code directly, in this case 13
      submit( event ) {
        // do something, or not, with the keydown event, maybe event.preventDefault()
        console.log("YES")
      }
  */

  //Mouse is moved


  _createClass(Editor, [{
    key: 'handleMouseMove',
    value: function handleMouseMove(e) {
      var _this2 = this;

      if (this.state.movingObject != 0) {
        //var stateCopy = Object.assign({}, this.state);
        //var lastSelectedObject = stateCopy.selectedObject
        var lastSelectedObject = this.state.selectedObject;
        lastSelectedObject.x = e.clientX;
        lastSelectedObject.y = e.clientY;
        //Check all connections if the are related to the slected object and make them fit nicely while moving
        lastSelectedObject.connectedConnections.map(function (obj, index) {
          _this2.correctConnection(obj);
        });

        //this.setState(stateCopy);
        this.setState({ selectedObject: lastSelectedObject });
      } else if (this.state.drawingline == 1) {
        //Use is drawing line, make line larger
        var stateCopy = Object.assign({}, this.state);
        var lastLine = stateCopy.connections[stateCopy.connections.length - 1];
        lastLine.x2 = e.clientX;
        lastLine.y2 = e.clientY;
        this.setState(stateCopy);
      }
    }

    //Select object at certain position (if an object exists at the position)

  }, {
    key: 'selectObject',
    value: function selectObject(posX, posY) {
      var _this3 = this;

      var isObjectFound = 0;
      //Is position at a object? Select it, and deselect the rest
      this.state.objects.map(function (obj, index) {
        if (posX > obj.x - 25 && posX < obj.x + 25) {
          if (posY > obj.y - 25 && posY < obj.y + 25) {
            //Yes found object, deselect al objects and select current object
            _this3.deselectAll();
            obj["selected"] = 1;
            _this3.setState({ selectedObject: obj });
            isObjectFound = 1; //object selected
          }
        }
      });

      //Is position at a connection? Select it, delesecting the rest
      this.state.connections.map(function (obj, index) {

        if (obj["corner"] == "left") {
          var condition1 = posX > obj.x1 && posX < obj.x2 && posY < obj.y2 + 5 && posY > obj.y2 - 5 || posX > obj.x1 - 5 && posX < obj.x1 + 5 && posY > obj.y1 && posY < obj.y2;
          var condition2 = posX > obj.x1 && posX < obj.x2 && posY < obj.y2 + 5 && posY > obj.y2 - 5 || posX > obj.x1 - 5 && posX < obj.x1 + 5 && posY > obj.y2 && posY < obj.y1;
          var condition3 = posX > obj.x2 && posX < obj.x1 && posY < obj.y2 + 5 && posY > obj.y2 - 5 || posX > obj.x1 - 5 && posX < obj.x1 + 5 && posY > obj.y2 && posY < obj.y1;
          var condition4 = posX > obj.x2 && posX < obj.x1 && posY < obj.y2 + 5 && posY > obj.y2 - 5 || posX > obj.x1 - 5 && posX < obj.x1 + 5 && posY > obj.y1 && posY < obj.y2;

          if (obj.x1 < obj.x2 && obj.y1 < obj.y2 && condition1 || obj.x1 < obj.x2 && obj.y1 > obj.y2 && condition2 || obj.x2 < obj.x1 && obj.y2 < obj.y1 && condition3 || obj.x1 > obj.x2 && obj.y2 > obj.y1 && condition4) {
            //Yes found object, deselect al objects and select current object
            _this3.deselectAll();
            obj["selected"] = 1;
            _this3.setState({ selectedObject: obj });

            obj["corner"] = "right"; //switch corner connection if clicked
            isObjectFound = 1;
            _this3.correctConnection(obj); //Beautify it again
          }
        }
        //Right
        else {
            var _condition = posX > obj.x1 && posX < obj.x2 && posY < obj.y1 + 5 && posY > obj.y1 - 5 || posX > obj.x2 - 5 && posX < obj.x2 + 5 && posY > obj.y1 && posY < obj.y2;
            var _condition2 = posX > obj.x1 && posX < obj.x2 && posY < obj.y1 + 5 && posY > obj.y1 - 5 || posX > obj.x2 - 5 && posX < obj.x2 + 5 && posY > obj.y2 && posY < obj.y1;
            var _condition3 = posX > obj.x2 && posX < obj.x1 && posY < obj.y1 + 5 && posY > obj.y1 - 5 || posX > obj.x2 - 5 && posX < obj.x2 + 5 && posY > obj.y2 && posY < obj.y1;
            var _condition4 = posX > obj.x2 && posX < obj.x1 && posY < obj.y1 + 5 && posY > obj.y1 - 5 || posX > obj.x2 - 5 && posX < obj.x2 + 5 && posY > obj.y1 && posY < obj.y2;

            if (obj.x1 < obj.x2 && obj.y1 < obj.y2 && _condition || obj.x1 < obj.x2 && obj.y1 > obj.y2 && _condition2 || obj.x2 < obj.x1 && obj.y2 < obj.y1 && _condition3 || obj.x1 > obj.x2 && obj.y2 > obj.y1 && _condition4) {
              //Yes found object, deselect al objects and select current object
              _this3.deselectAll();
              obj["selected"] = 1;
              _this3.setState({ selectedObject: obj });
              obj["corner"] = "left"; //switch corner connection if clicked
              isObjectFound = 1;
              _this3.correctConnection(obj); //Beautify it again
            }
          }
      });

      if (isObjectFound == 1) this.forceUpdate();
      return isObjectFound;
    }

    //Mouse is clicked down

  }, {
    key: 'handleMouseDown',
    value: function handleMouseDown(e) {
      //Users wants to draw a connect Line,
      if (this.state.mode == "connect" && e.target.id == "") {
        this.addConnection(e.clientX, e.clientY);
      }
      //Click in editor means: add object, except when in play mode or on top of other object
      else {
          if (this.state.mode != "play" && this.state.mode != "" && this.state.mode != "connect") {
            if (this.selectObject(e.clientX, e.clientY) != 0) //Select object in case we clicked on it (or on a connection)
              this.setState({ movingObject: 1 });else this.setState({ selectedObject: 0 });
          }
        }
    }
    //Mouse is clicked up

  }, {
    key: 'handleMouseUp',
    value: function handleMouseUp(e) {

      if (this.state.movingObject != 0) {
        this.setState({ movingObject: 0 });
      }
      //Stop drawing line if we'r drawing and make the connection line nice after validity check (it has to connect 2 objects)
      if (this.state.drawingline == 1) {
        this.setState({ drawingline: 0 });
        if (this.isLastConnectionValid() == 1) this.correctLastConnection(); //Make it fit nicely to the objects
        else this.removeLastConnection();

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
        //Click in editor means: add object, except when in play mode or on top of other object
        else {
            if (this.state.mode != "play" && this.state.mode != "" && this.state.mode != "connect") {
              //if (this.selectObject(e.clientX,e.clientY) == 0) //Select object in case we clicked on it (or on a connection)
              if (this.state.selectedObject == 0) this.addObject(e.clientX, e.clientY);
            }
          }
    }

    //keypress reveived

  }, {
    key: 'handleKeyDown',
    value: function handleKeyDown(event) {
      console.log("Key press");

      if (event) {
        //Delete key
        if (event.which == 46) {
          this.deleteSelectedObject();
        }
      }
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      var self = this;
      document.addEventListener('mouseup', self.handleMouseUp, false); //click
      document.addEventListener('mousedown', self.handleMouseDown, false);
      document.addEventListener('mousemove', self.handleMouseMove, false);
      document.addEventListener('keydown', self.handleKeyDown, false);
    }
  }, {
    key: 'deleteSelectedObject',
    value: function deleteSelectedObject() {
      var stateCopy = Object.assign({}, this.state);

      var so = stateCopy.selectedObject;

      //There is a selected objects let kill it
      if (so != 0) {

        //Does it have connected connections remove these also
        if (so.connectedConnections) {
          so.connectedConnections.map(function (obj, index) {
            var index = stateCopy.connections.indexOf(obj);
            if (index > -1) {
              stateCopy.connections.splice(index, 1);
            }
          });
        }

        //Remove the object itself (or connection if its not an object)
        var index = stateCopy.objects.indexOf(so);
        if (index > -1) {
          stateCopy.objects.splice(index, 1);
        }
        index = stateCopy.connections.indexOf(so);
        if (index > -1) {
          stateCopy.connections.splice(index, 1);
        }

        this.setState(stateCopy);
      }

      //this.state.objects.map((obj,index) => {})
      //this.state.connections.map((obj,index) => {})
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
        lastLine["to"].connectedConnections.push(lastLine);
        lastLine["from"].connectedConnections.push(lastLine);
        this.setState({ connections: stateCopy.connections });
        return 1;
      }
      return 0;
    }

    //correct a given connection so its fits nicely between two objects. ano object can connec in 2 ways, so switch mode also

  }, {
    key: 'correctConnection',
    value: function correctConnection(c) {
      //var stateCopy = Object.assign({}, this.state);
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
      //if we get in the else clause it might mean the connection line does not connect the from and to objects anymore, due to moving an object
      //Check if connection has from and to object set and reset it to the middle, calling the correction again
      else {
          if (c.from != 0 && c.to != 0) {
            c.x1 = c.from.x;
            c.y1 = c.from.y;
            c.x2 = c.to.x;
            c.y2 = c.to.y;
            this.correctConnection(c);
          }
        }
      if (this.state.movingObject == 0) //While moving do not refresh the screen.
        this.forceUpdate();
      //this.setState({connections : stateCopy.connections})
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

    //Deselect all objects and connections

  }, {
    key: 'deselectAll',
    value: function deselectAll() {
      this.state.objects.map(function (obj, index) {
        obj["selected"] = 0;
      });
      this.state.connections.map(function (obj, index) {
        obj["selected"] = 0;
      });
    }
    //Add object in Editor

  }, {
    key: 'addObject',
    value: function addObject(x, y) {
      this.deselectAll();
      this.state.objects.push({ name: "Change this", x: x, y: y, objType: this.state.mode, selected: 0, connectedConnections: [] });
      this.forceUpdate();
    }
    //Add connection between two objects

  }, {
    key: 'addConnection',
    value: function addConnection(x, y) {
      this.deselectAll();
      this.state.connections.push({ x1: x, y1: y, x2: x, y2: y, styling: "1px solid black", corner: "right", selected: 0, from: 0, to: 0 });
      this.setState({ drawingline: 1 });
      this.forceUpdate();
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
      document.removeEventListener('keydown', this.handleKeyDown, false);
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
          if (y2 > y1) return "images/triangle-down.png";else return "images/triangle-up.png";
        }
      };

      //Get object style, which is the same except when selected
      var getObjectStyle = function getObjectStyle(obj) {
        var result = { position: "absolute", top: obj.y - 25 + 'px', left: obj.x - 25 + 'px', width: '50px', height: '50px' };
        if (obj.selected == 1) result["outline"] = '6px dotted orange';

        return result;
      };

      //Get style for the connection objects
      var getConnectionStyle = function getConnectionStyle(obj) {
        var result;
        if (obj.selected == 1) result = "1px dotted orange";else result = "1px solid black";

        return result;
      };

      //Based on the connection object render the connection lines and triangle
      var getConnection = function getConnection(obj, index) {
        if (obj["corner"] == "right") {
          return _react2.default.createElement(
            'div',
            { key: "connection_" + index },
            _react2.default.createElement(_Line2.default, { key: "connection_1_" + index,
              from: { x: obj.x1, y: obj.y1 },
              to: { x: obj.x2, y: obj.y1 }, style: getConnectionStyle(obj) }),
            _react2.default.createElement(_Line2.default, { key: "connection_2_" + index,
              from: { x: obj.x2, y: obj.y1 },
              to: { x: obj.x2, y: obj.y2 }, style: getConnectionStyle(obj) }),
            _react2.default.createElement('img', { key: "connection_3_" + index,
              style: { position: "absolute", top: obj.y1 - 8 + 'px', left: obj.x2 - (obj.x2 - obj.x1) / 2 + 'px' },
              src: getTriangle(obj.x1, obj.y1, obj.x2, obj.y2, obj.corner) })
          );
        } else {
          return _react2.default.createElement(
            'div',
            { key: "connection_" + index },
            _react2.default.createElement(_Line2.default, { key: "connection_1_" + index,
              from: { x: obj.x1, y: obj.y1 },
              to: { x: obj.x1, y: obj.y2 }, style: getConnectionStyle(obj) }),
            _react2.default.createElement(_Line2.default, { key: "connection_2_" + index,
              from: { x: obj.x1, y: obj.y2 },
              to: { x: obj.x2, y: obj.y2 }, style: getConnectionStyle(obj) }),
            _react2.default.createElement('img', { key: "connection_3_" + index,
              style: { position: "absolute", top: obj.y2 - (obj.y2 - obj.y1) / 2 + 'px', left: obj.x1 - 8 + 'px' },
              src: getTriangle(obj.x1, obj.y1, obj.x2, obj.y2, obj.corner) })
          );
        }
      };

      return _react2.default.createElement(
        'div',
        { className: 'Editor', id: 'editor' },
        this.state.connections.map(function (obj, index) {
          return getConnection(obj, index);
        }),
        this.state.objects.map(function (obj, index) {
          return _react2.default.createElement(
            'div',
            { key: "obj_" + index },
            _react2.default.createElement('img', { ondragstart: 'return false;', className: 'Editor', key: "obj_" + index,
              style: getObjectStyle(obj),
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
  url: _react2.default.PropTypes.string };

Editor.defaultProps = {
  url: "http://localhost:3000/pandaweb/all"
};

exports.default = Editor;