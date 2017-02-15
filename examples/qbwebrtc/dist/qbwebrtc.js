(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hypertyLoaded = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = ActionsCall;
function ActionsCall(_ref) {
    var call = _ref.call,
        videoCall = _ref.videoCall,
        onChangeDomain = _ref.onChangeDomain,
        resolveDomain = _ref.resolveDomain,
        domain = _ref.domain,
        email = _ref.email;

    return React.createElement(
        "div",
        { className: "row" },
        React.createElement(
            "form",
            { className: "form-inline" },
            React.createElement(
                "div",
                { className: "form-group" },
                React.createElement(
                    "label",
                    { className: "sr-only", htmlFor: "address" },
                    "Address"
                ),
                React.createElement("input", { type: "email", onChange: resolveDomain, className: "form-control", id: "address", placeholder: "Address", value: email })
            ),
            React.createElement(
                "div",
                { className: "form-group" },
                React.createElement(
                    "label",
                    { className: "sr-only", htmlFor: "domain" },
                    "Domain"
                ),
                React.createElement("input", { type: "text", onChange: onChangeDomain, className: "form-control", id: "domain", placeholder: domain })
            ),
            React.createElement(
                "a",
                { href: "#", onClick: call, className: "btn btn-default" },
                "Call"
            ),
            React.createElement(
                "a",
                { href: "#", onClick: videoCall, className: "btn btn-default" },
                "VideoCall"
            )
        )
    );
}
module.exports = exports["default"];

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var ActionsHangup = function ActionsHangup(_ref) {
    var hangup = _ref.hangup;

    return React.createElement(
        "div",
        { className: "row" },
        React.createElement(
            "form",
            { className: "form-inline" },
            React.createElement(
                "a",
                { href: "#", onClick: hangup, className: "btn btn-default" },
                "HANGUP"
            )
        )
    );
};

exports.default = ActionsHangup;
module.exports = exports["default"];

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var ActionsIncomingCall = function ActionsIncomingCall(_ref) {
    var acceptCall = _ref.acceptCall,
        rejectCall = _ref.rejectCall;

    return React.createElement(
        "div",
        { className: "row" },
        React.createElement(
            "form",
            { className: "form-inline" },
            React.createElement(
                "a",
                { href: "#", onClick: acceptCall, className: "btn btn-default" },
                "ACCEPT"
            ),
            React.createElement(
                "a",
                { href: "#", onClick: rejectCall, className: "btn btn-default" },
                "REJECT"
            )
        )
    );
};

exports.default = ActionsIncomingCall;
module.exports = exports["default"];

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ActionsCall = require('./ActionsCall');

var _ActionsCall2 = _interopRequireDefault(_ActionsCall);

var _ActionsHangup = require('./ActionsHangup');

var _ActionsHangup2 = _interopRequireDefault(_ActionsHangup);

var _ActionsIncomingCall = require('./ActionsIncomingCall');

var _ActionsIncomingCall2 = _interopRequireDefault(_ActionsIncomingCall);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ActionPanel = React.createClass({
  displayName: 'ActionPanel',
  getInitialState: function getInitialState() {
    return { domain: 'Domain', email: '' };
  },
  render: function render() {
    var _this = this;

    if (this.props.callStatus === 'IN_A_CALL') {
      return React.createElement(_ActionsHangup2.default, { hangup: this.props.hangup });
    } else if (this.props.callStatus === 'INCOMING_CALL') {
      return React.createElement(_ActionsIncomingCall2.default, { acceptCall: this.props.acceptCall, rejectCall: this.props.hangup });
    } else {
      var actionsProp = { email: this.state.email, domain: this.state.domain,
        onChangeDomain: this.changeDomain,
        resolveDomain: this.resolveDomain,
        call: function call() {
          return _this.props.call(_this.state.email, _this.state.domain);
        },
        videoCall: function videoCall() {
          return _this.props.videoCall(_this.state.email, _this.state.domain);
        }
      };
      return React.createElement(_ActionsCall2.default, actionsProp);
    }
  },
  changeDomain: function changeDomain(event) {
    this.setState({ domain: event.target.value });
  },
  resolveDomain: function resolveDomain(event) {
    this.setState({ email: event.target.value });
    var parts = event.target.value.split('@');
    if (parts.length > 1) this.setState({ domain: parts[1] });
  }
});

exports.default = ActionPanel;
module.exports = exports['default'];

},{"./ActionsCall":1,"./ActionsHangup":2,"./ActionsIncomingCall":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var HypertyInfo = function HypertyInfo(_ref) {
    var username = _ref.username,
        avatar = _ref.avatar,
        runtimeHypertyURL = _ref.runtimeHypertyURL;

    return React.createElement(
        "div",
        { className: "row" },
        React.createElement(
            "div",
            { className: "col-xs-12" },
            React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                    "div",
                    { className: "col-xs-4" },
                    React.createElement("img", { src: avatar })
                ),
                React.createElement(
                    "div",
                    { className: "col-xs-8" },
                    React.createElement(
                        "div",
                        { className: "row" },
                        React.createElement(
                            "div",
                            { className: "col-xs-12" },
                            username
                        )
                    ),
                    React.createElement(
                        "div",
                        { className: "row" },
                        React.createElement(
                            "div",
                            { className: "col-xs-12" },
                            runtimeHypertyURL
                        )
                    )
                )
            )
        )
    );
};

exports.default = HypertyInfo;
module.exports = exports["default"];

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var Logo = function Logo(_ref) {
    var logoPath = _ref.logoPath;

    return React.createElement(
        "div",
        { className: "row" },
        React.createElement(
            "div",
            { className: "col-xs-4" },
            "Logo"
        )
    );
};

exports.default = Logo;
module.exports = exports["default"];

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var StatusPanel = function StatusPanel(_ref) {
    var state = _ref.state,
        address = _ref.address;

    return React.createElement(
        "div",
        { className: "row" },
        React.createElement(
            "div",
            { className: "col-xs-10 col-xs-offset-2" },
            React.createElement(
                "strong",
                null,
                address
            ),
            React.createElement(
                "strong",
                null,
                "...",
                state
            )
        )
    );
};

exports.default = StatusPanel;
module.exports = exports["default"];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var VideoPanel = function VideoPanel(_ref) {
    var remoteVideo = _ref.remoteVideo,
        localVideo = _ref.localVideo;

    var content = void 0;
    if (remoteVideo) {
        return React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
                'div',
                { className: 'col-xs-2' },
                React.createElement('video', { autoPlay: true, muted: 'true', src: localVideo ? URL.createObjectURL(localVideo) : '' })
            ),
            React.createElement(
                'div',
                { className: 'col-xs-10' },
                React.createElement('video', { autoPlay: true, src: URL.createObjectURL(remoteVideo) })
            )
        );
    }

    return React.createElement('div', null);
};

exports.default = VideoPanel;
module.exports = exports['default'];

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = hypertyLoaded;

var _ActionPanel = require('./ActionPanel');

var _ActionPanel2 = _interopRequireDefault(_ActionPanel);

var _Logo = require('./Logo');

var _Logo2 = _interopRequireDefault(_Logo);

var _HypertyInfo = require('./HypertyInfo');

var _HypertyInfo2 = _interopRequireDefault(_HypertyInfo);

var _VideoPanel = require('./VideoPanel');

var _VideoPanel2 = _interopRequireDefault(_VideoPanel);

var _StatusPanel = require('./StatusPanel');

var _StatusPanel2 = _interopRequireDefault(_StatusPanel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Main = React.createClass({
    displayName: 'Main',
    call: function call(email, domain) {
        var _this = this;

        var constraints = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { audio: true, video: false };

        console.log('call', { email: email, domain: domain, constraints: constraints });
        var hyperty = this.props.hyperty;
        hyperty.discovery.discoverHypertyPerUser(email, domain).then(function (result) {
            _this.setState({ address: result.hypertyURL });
            hyperty.setIceServer([{
                urls: "turn:numb.viagenie.ca",
                username: "steffen.druesedow@telekom.de",
                credential: "w0nd3r"
            }], null);
            hyperty.setMediaOptions(constraints);
            hyperty.connect(result.hypertyURL).then(function (obj) {
                _this.setState({ callStatus: 'RINGING' });
            });
        }).catch(console.error);
    },
    videoCall: function videoCall(email, domain) {
        console.log('videoCall');
        this.call(email, domain, { audio: true, video: true });
    },
    resetState: function resetState() {
        this.setState({ callStatus: '', address: '', remoteVideo: '', localVideo: '' });
    },
    hangup: function hangup() {
        this.props.hyperty.disconnect();
        this.resetState();
    },
    acceptCall: function acceptCall() {
        this.props.hyperty.acceptCall();
        this.setState({ callStatus: 'IN_A_CALL' });
    },
    getInitialState: function getInitialState() {
        var _this2 = this;

        this.props.hyperty.addEventListener('remotevideo', function (stream) {
            return _this2.setState({ remoteVideo: stream, callStatus: _this2.state.callStatus === 'INCOMING_CALL' ? 'INCOMING_CALL' : 'IN_A_CALL' });
        });
        this.props.hyperty.addEventListener('localvideo', function (stream) {
            return _this2.setState({ localVideo: stream });
        });
        this.props.hyperty.addEventListener('disconnected', function () {
            console.log('dis-j');_this2.resetState();
        });
        this.props.hyperty.addEventListener('incomingcall', function (identity) {
            return _this2.setState({ callStatus: 'INCOMING_CALL' });
        });

        return { callStatus: '', address: '', remoteVideo: '', localVideo: '' };
    },
    render: function render() {
        var actionProps = _extends({}, this.props, { call: this.call, videoCall: this.videoCall, callStatus: this.state.callStatus, hangup: this.hangup, acceptCall: this.acceptCall });
        var hypertyProps = _extends({ runtimeHypertyURL: this.props.runtimeHypertyURL }, this.props.identity);

        return React.createElement(
            'div',
            { className: 'container-fluid' },
            React.createElement(_Logo2.default, null),
            React.createElement(_HypertyInfo2.default, hypertyProps),
            React.createElement(_ActionPanel2.default, actionProps),
            React.createElement(_VideoPanel2.default, { remoteVideo: this.state.remoteVideo, localVideo: this.state.localVideo }),
            React.createElement(_StatusPanel2.default, { state: this.state.callStatus, address: this.state.address })
        );
    }
});

function hypertyLoaded(result) {
    result.instance.identityManager.discoverUserRegistered().then(function (identity) {
        var element = React.createElement(Main, { identity: identity, runtimeHypertyURL: result.runtimeHypertyURL, hyperty: result.instance });
        ReactDOM.render(element, document.getElementById('root'));
    }).catch(console.error);
}
module.exports = exports['default'];

},{"./ActionPanel":4,"./HypertyInfo":5,"./Logo":6,"./StatusPanel":7,"./VideoPanel":8}]},{},[9])(9)
});