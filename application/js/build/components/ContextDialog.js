'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _rodal = require('rodal');

var _rodal2 = _interopRequireDefault(_rodal);

var _reactList = require('react-list');

var _reactList2 = _interopRequireDefault(_reactList);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//import 'react-select/dist/react-select.css'; //File is copied to css/components
//Which will be put in build.css by our build script

/*
[
 {"0":
   {"nodeId":0,
   "host":"ec2-52-209-29-218.eu-west-1.compute.amazonaws.com",
   "port":9092
   }
 },
 {"metadata":
   {"ciss":
     {"0":
       {"topic": "ciss",
       "partition":0,
       "leader":0,
       "replicas":[0],
       "isr":[0]
       }
     }
   }
 }
]
*/

var ContextDialog = function (_React$Component) {
  _inherits(ContextDialog, _React$Component);

  function ContextDialog(props) {
    _classCallCheck(this, ContextDialog);

    var _this = _possibleConstructorReturn(this, (ContextDialog.__proto__ || Object.getPrototypeOf(ContextDialog)).call(this, props));

    _this.renderItem = _this.renderItem.bind(_this);
    _this.changeTopic = _this.changeTopic.bind(_this);

    _this.state = { visible: props.visible, selectedObject: props.selectedObject,
      messages: [], topics: [], selectedTopic: "" };

    //Create Kafka consumer
    _this.props.socket.emit('clientmessage', { type: "connectKafkaConsumer", zooKeeper: "52.209.29.218:2181/" }); //, topic : "ciss"


    //receive event from server
    _this.props.socket.on('serverevent', function (ev_msg) {
      if (ev_msg.type == 'kafkamessage') {
        console.log("topic message via kafkia was received: " + ev_msg.message.value);
        console.log(ev_msg.message.value);
        var stateCopy = Object.assign({}, _this.state);
        var messages = stateCopy.messages.push(ev_msg.message.value);
        _this.setState(stateCopy);
        if (_this.list) _this.list.scrollTo(_this.state.messages.length);
      } else if (ev_msg.type == 'kafkatopics') {
        console.log("topics list received from server");

        var stateCopy = Object.assign({}, _this.state);
        stateCopy.topics = []; //Reset any values in the topics list , we will receive a new updated list now.
        var len = ev_msg.message.length;
        for (var i = 0; i < len; i++) {
          Object.keys(ev_msg.message[i]).map(function (keys, index) {
            if (keys == "metadata") {
              Object.keys(ev_msg.message[i].metadata).map(function (tp, index) {
                var topic = { value: tp, label: tp };
                var topics = stateCopy.topics.push(topic);
              });
            }
          });
        }
        _this.setState(stateCopy);
      }
    });
    return _this;
  }

  _createClass(ContextDialog, [{
    key: 'changeTopic',
    value: function changeTopic(topic) {
      console.log("Selected: " + topic);
      this.setState({ selectedTopic: topic });
    }

    //Dialog is closing

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.props.socket.emit('clientmessage', { type: "disconnectKafkaConsumer" });
    }
  }, {
    key: 'show',
    value: function show() {
      this.setState({ visible: true });
    }
  }, {
    key: 'hide',
    value: function hide() {
      //this.list = []
      this.setState({ visible: false });
      this.props.onClick();
    }
  }, {
    key: 'onHandleChange',
    value: function onHandleChange(e) {
      var stateCopy = Object.assign({}, this.state);

      stateCopy.selectedObject.name = e.target.value;
      this.setState(stateCopy);

      this.props.onChange(this.state.selectedObject);
    }
  }, {
    key: 'renderItem',
    value: function renderItem(index, key) {
      //console.log("index : " + index)
      var self = this;

      return _react2.default.createElement(
        'div',
        { key: key },
        self.state.messages[index]
      );
    }
  }, {
    key: 'render',
    value: function render() {

      var self = this;

      var myBtn = _react2.default.createElement(
        'button',
        { id: 'closebtn', onClick: this.props.onClick },
        'Close Dialog'
      );
      var objName = _react2.default.createElement('input', { id: 'objname', type: 'text', value: this.state.selectedObject.name,
        onChange: this.onHandleChange.bind(this) });
      var eventList = _react2.default.createElement(_reactList2.default, { itemRenderer: self.renderItem, length: self.state.messages.length, type: 'simple', ref: function ref(c) {
          return self.list = c;
        } });
      //let topicList = ({self.state.topics}</h4>)  //this.state.topics
      var topicList = _react2.default.createElement(_reactSelect2.default, { name: 'form-field-name', value: this.state.selectedTopic, options: self.state.topics, onChange: self.changeTopic });

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _rodal2.default,
          {
            customStyles: { position: "absolute", height: "430px", top: this.state.selectedObject.y + 'px', left: this.state.selectedObject.x + 'px' },
            visible: this.state.visible, onClose: this.hide.bind(this) },
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'p',
              null,
              'Name: ',
              objName,
              ' ',
              myBtn
            ),
            _react2.default.createElement(
              'p',
              null,
              'Topic: ',
              topicList
            ),
            _react2.default.createElement(
              'div',
              { style: { height: 300, overflow: 'scroll' } },
              'Monitor events:',
              eventList
            )
          )
        )
      );
    }
  }]);

  return ContextDialog;
}(_react2.default.Component);

exports.default = ContextDialog;