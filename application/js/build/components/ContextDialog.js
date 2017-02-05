'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _rodal = require('rodal');

var _rodal2 = _interopRequireDefault(_rodal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ContextDialog = function (_React$Component) {
    _inherits(ContextDialog, _React$Component);

    function ContextDialog(props) {
        _classCallCheck(this, ContextDialog);

        var _this = _possibleConstructorReturn(this, (ContextDialog.__proto__ || Object.getPrototypeOf(ContextDialog)).call(this, props));

        _this.state = { visible: props.visible, selectedObject: props.selectedObject };
        return _this;
    }

    _createClass(ContextDialog, [{
        key: 'show',
        value: function show() {
            this.setState({ visible: true });
        }
    }, {
        key: 'hide',
        value: function hide() {
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
        //    handleClick(e) {
        //        console.log('this is:', e.target.id);
        //      }

    }, {
        key: 'render',
        value: function render() {

            var myBtn = _react2.default.createElement(
                'button',
                { id: 'closebtn', onClick: this.props.onClick },
                'Close Dialog'
            );
            var objName = _react2.default.createElement('input', { id: 'objname', type: 'text', value: this.state.selectedObject.name,
                onChange: this.onHandleChange.bind(this) });

            var self = this;
            return _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                    _rodal2.default,
                    {
                        customStyles: { position: "absolute", top: this.state.selectedObject.y + 'px', left: this.state.selectedObject.x + 'px' },
                        visible: this.state.visible, onClose: this.hide.bind(this) },
                    _react2.default.createElement(
                        'div',
                        null,
                        'Name: ',
                        objName,
                        ' ',
                        myBtn
                    )
                )
            );
        }
    }]);

    return ContextDialog;
}(_react2.default.Component);

exports.default = ContextDialog;