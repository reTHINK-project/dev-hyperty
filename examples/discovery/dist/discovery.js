(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.hypertyLoaded = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
            React.createElement("img", { src: "qbwebrtc/assets/logo_quobis_claim.png", className: "img-responsive", alt: "Logo Quobis" })
        )
    );
};

exports.default = Logo;
module.exports = exports["default"];

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Logo = require('./Logo');

var _Logo2 = _interopRequireDefault(_Logo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Main = React.createClass({
    displayName: 'Main',
    onUserListChanged: function onUserListChanged() {
        var _this = this;

        console.log('new user event');
        this.props.hyperty.queryUsers().then(function (users) {
            console.log('users', users);
            _this.setState({ users: users });
        });
    },
    getInitialState: function getInitialState() {
        var _this2 = this;

        console.log('dicoveryH');
        this.props.hyperty.onUserListChanged(this.onUserListChanged);
        this.props.hyperty.queryUsers().then(function (users) {
            _this2.setState({ users: users });
        });

        return { users: [] };
    },
    render: function render() {
        return React.createElement(
            'div',
            { className: 'container-fluid' },
            React.createElement(_Logo2.default, null),
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'col-sm-12' },
                    React.createElement(
                        'a',
                        { href: '#' },
                        'Users ',
                        React.createElement(
                            'span',
                            { className: 'badge' },
                            this.state.users.length
                        )
                    )
                )
            )
        );
    }
});

exports.default = Main;
module.exports = exports['default'];

},{"./Logo":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = hypertyLoaded;

var _Main = require('./Main');

var _Main2 = _interopRequireDefault(_Main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function hypertyLoaded(result) {
    var element = React.createElement(_Main2.default, { runtimeHypertyURL: result.runtimeHypertyURL, hyperty: result.instance });
    ReactDOM.render(element, document.getElementById('root'));
}
module.exports = exports['default'];

},{"./Main":2}]},{},[3])(3)
});