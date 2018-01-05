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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Main = React.createClass({
    displayName: 'Main',
    onUserListChanged: function onUserListChanged() {
        this.setState({ users: this.props.hyperty.queryUsers() });
    },
    getInitialState: function getInitialState() {
        this.props.hyperty.onUserListChanged(this.onUserListChanged);

        return { users: this.props.hyperty.queryUsers() };
    },
    handleInputChange: function handleInputChange(event) {
        var target = event.target;
        var value = target.type === 'checkbox' ? target.checked : target.value;
        var name = target.name;

        this.setState(_defineProperty({}, name, value));
    },
    search: function search() {
        var filter = this.state.filter ? JSON.parse(this.state.filter) : null;
        var result = this.props.hyperty.queryUsers(filter);
        this.setState({ search_result: JSON.stringify(result) });
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
            ),
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'form',
                    null,
                    React.createElement(
                        'div',
                        { className: 'form-group' },
                        React.createElement(
                            'label',
                            { htmlFor: 'search' },
                            'Search'
                        ),
                        React.createElement('input', { type: 'text', name: 'filter', onChange: this.handleInputChange, className: 'form-control', id: 'search', placeholder: '{\'username\':\'openidtest20@gmail.com\'}' })
                    ),
                    React.createElement(
                        'button',
                        { type: 'button', className: 'btn btn-default', onClick: this.search },
                        'Search'
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'row' },
                React.createElement(
                    'div',
                    { className: 'col-sm-12' },
                    this.state.search_result
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni43LjAvbGliL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJMb2dvL2luZGV4LmpzIiwiTWFpbi5qcyIsImRpc2NvdmVyeS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0FDQUEsSUFBTSxPQUFPLFNBQVAsSUFBTyxPQUFnQjtBQUFBLFFBQWQsUUFBYyxRQUFkLFFBQWM7O0FBQzNCLFdBQVE7QUFBQTtBQUFBLFVBQUssV0FBVSxLQUFmO0FBQ0k7QUFBQTtBQUFBLGNBQUssV0FBVSxVQUFmO0FBQ0kseUNBQUssS0FBSSx1Q0FBVCxFQUFpRCxXQUFVLGdCQUEzRCxFQUE0RSxLQUFJLGFBQWhGO0FBREo7QUFESixLQUFSO0FBS0QsQ0FORDs7a0JBUWUsSTs7Ozs7Ozs7OztBQ1JmOzs7Ozs7OztBQUVBLElBQU0sT0FBTyxNQUFNLFdBQU4sQ0FBa0I7QUFBQTtBQUUzQixxQkFGMkIsK0JBRVA7QUFDaEIsYUFBSyxRQUFMLENBQWMsRUFBQyxPQUFPLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsVUFBbkIsRUFBUixFQUFkO0FBQ0gsS0FKMEI7QUFNM0IsbUJBTjJCLDZCQU1WO0FBQ2YsYUFBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixpQkFBbkIsQ0FBcUMsS0FBSyxpQkFBMUM7O0FBRUEsZUFBTyxFQUFDLE9BQU0sS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixVQUFuQixFQUFQLEVBQVA7QUFDRCxLQVYwQjtBQVkzQixxQkFaMkIsNkJBWVIsS0FaUSxFQVlEO0FBQ3RCLFlBQU0sU0FBUyxNQUFNLE1BQXJCO0FBQ0EsWUFBTSxRQUFRLE9BQU8sSUFBUCxLQUFnQixVQUFoQixHQUE2QixPQUFPLE9BQXBDLEdBQThDLE9BQU8sS0FBbkU7QUFDQSxZQUFNLE9BQU8sT0FBTyxJQUFwQjs7QUFFQSxhQUFLLFFBQUwscUJBQ0csSUFESCxFQUNVLEtBRFY7QUFHSCxLQXBCMEI7QUFzQjNCLFVBdEIyQixvQkFzQmpCO0FBQ04sWUFBSSxTQUFTLEtBQUssS0FBTCxDQUFXLE1BQVgsR0FBa0IsS0FBSyxLQUFMLENBQVcsS0FBSyxLQUFMLENBQVcsTUFBdEIsQ0FBbEIsR0FBZ0QsSUFBN0Q7QUFDQSxZQUFJLFNBQVMsS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixVQUFuQixDQUE4QixNQUE5QixDQUFiO0FBQ0EsYUFBSyxRQUFMLENBQWMsRUFBQyxlQUFlLEtBQUssU0FBTCxDQUFlLE1BQWYsQ0FBaEIsRUFBZDtBQUNILEtBMUIwQjtBQTRCM0IsVUE1QjJCLG9CQTRCbEI7QUFDTCxlQUFRO0FBQUE7QUFBQSxjQUFLLFdBQVUsaUJBQWY7QUFDQSxxREFEQTtBQUVBO0FBQUE7QUFBQSxrQkFBSyxXQUFVLEtBQWY7QUFDSTtBQUFBO0FBQUEsc0JBQUssV0FBVSxXQUFmO0FBQ0k7QUFBQTtBQUFBLDBCQUFHLE1BQUssR0FBUjtBQUFBO0FBQWtCO0FBQUE7QUFBQSw4QkFBTSxXQUFVLE9BQWhCO0FBQXlCLGlDQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCO0FBQTFDO0FBQWxCO0FBREo7QUFESixhQUZBO0FBT0E7QUFBQTtBQUFBLGtCQUFLLFdBQVUsS0FBZjtBQUNJO0FBQUE7QUFBQTtBQUNFO0FBQUE7QUFBQSwwQkFBSyxXQUFVLFlBQWY7QUFDRTtBQUFBO0FBQUEsOEJBQU8sU0FBUSxRQUFmO0FBQUE7QUFBQSx5QkFERjtBQUVFLHVEQUFPLE1BQUssTUFBWixFQUFtQixNQUFLLFFBQXhCLEVBQWlDLFVBQVUsS0FBSyxpQkFBaEQsRUFBbUUsV0FBVSxjQUE3RSxFQUE0RixJQUFHLFFBQS9GLEVBQXdHLGFBQVksMkNBQXBIO0FBRkYscUJBREY7QUFLRTtBQUFBO0FBQUEsMEJBQVEsTUFBSyxRQUFiLEVBQXNCLFdBQVUsaUJBQWhDLEVBQWtELFNBQVMsS0FBSyxNQUFoRTtBQUFBO0FBQUE7QUFMRjtBQURKLGFBUEE7QUFnQkE7QUFBQTtBQUFBLGtCQUFLLFdBQVUsS0FBZjtBQUNJO0FBQUE7QUFBQSxzQkFBSyxXQUFVLFdBQWY7QUFDSyx5QkFBSyxLQUFMLENBQVc7QUFEaEI7QUFESjtBQWhCQSxTQUFSO0FBc0JIO0FBbkQwQixDQUFsQixDQUFiOztrQkFzRGUsSTs7Ozs7Ozs7O2tCQ3REUyxhOztBQUZ4Qjs7Ozs7O0FBRWUsU0FBUyxhQUFULENBQXVCLE1BQXZCLEVBQStCO0FBQzFDLFFBQU0sVUFBVSxzQ0FBTSxtQkFBbUIsT0FBTyxpQkFBaEMsRUFBbUQsU0FBUyxPQUFPLFFBQW5FLEdBQWhCO0FBQ0EsYUFBUyxNQUFULENBQWdCLE9BQWhCLEVBQXlCLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUF6QjtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IExvZ28gPSAoe2xvZ29QYXRofSkgPT4ge1xuICByZXR1cm4gKDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLXhzLTRcIj5cbiAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPSdxYndlYnJ0Yy9hc3NldHMvbG9nb19xdW9iaXNfY2xhaW0ucG5nJyBjbGFzc05hbWU9J2ltZy1yZXNwb25zaXZlJyBhbHQ9J0xvZ28gUXVvYmlzJy8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2Pik7XG59XG5cbmV4cG9ydCBkZWZhdWx0IExvZ29cbiIsImltcG9ydCBMb2dvIGZyb20gJy4vTG9nbydcblxuY29uc3QgTWFpbiA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICAgIG9uVXNlckxpc3RDaGFuZ2VkKCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHt1c2VyczogdGhpcy5wcm9wcy5oeXBlcnR5LnF1ZXJ5VXNlcnMoKX0pXG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZSgpe1xuICAgICAgdGhpcy5wcm9wcy5oeXBlcnR5Lm9uVXNlckxpc3RDaGFuZ2VkKHRoaXMub25Vc2VyTGlzdENoYW5nZWQpXG5cbiAgICAgIHJldHVybiB7dXNlcnM6dGhpcy5wcm9wcy5oeXBlcnR5LnF1ZXJ5VXNlcnMoKX07XG4gICAgfSxcblxuICAgIGhhbmRsZUlucHV0Q2hhbmdlIChldmVudCkge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGFyZ2V0LnR5cGUgPT09ICdjaGVja2JveCcgPyB0YXJnZXQuY2hlY2tlZCA6IHRhcmdldC52YWx1ZTtcbiAgICAgICAgY29uc3QgbmFtZSA9IHRhcmdldC5uYW1lO1xuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgIFtuYW1lXTogdmFsdWVcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNlYXJjaCAoKSB7XG4gICAgICAgIGxldCBmaWx0ZXIgPSB0aGlzLnN0YXRlLmZpbHRlcj9KU09OLnBhcnNlKHRoaXMuc3RhdGUuZmlsdGVyKTpudWxsXG4gICAgICAgIGxldCByZXN1bHQgPSB0aGlzLnByb3BzLmh5cGVydHkucXVlcnlVc2VycyhmaWx0ZXIpXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3NlYXJjaF9yZXN1bHQ6IEpTT04uc3RyaW5naWZ5KHJlc3VsdCl9KVxuICAgIH0sXG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiAoPGRpdiBjbGFzc05hbWU9XCJjb250YWluZXItZmx1aWRcIj5cbiAgICAgICAgICAgICAgICA8TG9nbyAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLXNtLTEyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiI1wiPlVzZXJzIDxzcGFuIGNsYXNzTmFtZT1cImJhZGdlXCI+e3RoaXMuc3RhdGUudXNlcnMubGVuZ3RofTwvc3Bhbj48L2E+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCI+XG4gICAgICAgICAgICAgICAgICAgIDxmb3JtPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGh0bWxGb3I9XCJzZWFyY2hcIj5TZWFyY2g8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImZpbHRlclwiIG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUlucHV0Q2hhbmdlfSBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBpZD1cInNlYXJjaFwiIHBsYWNlaG9sZGVyPVwieyd1c2VybmFtZSc6J29wZW5pZHRlc3QyMEBnbWFpbC5jb20nfVwiLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJidG4gYnRuLWRlZmF1bHRcIiBvbkNsaWNrPXt0aGlzLnNlYXJjaH0+U2VhcmNoPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC1zbS0xMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RoaXMuc3RhdGUuc2VhcmNoX3Jlc3VsdH1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2Pik7XG4gICAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IE1haW5cbiIsImltcG9ydCBNYWluIGZyb20gJy4vTWFpbidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaHlwZXJ0eUxvYWRlZChyZXN1bHQpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gPE1haW4gcnVudGltZUh5cGVydHlVUkw9e3Jlc3VsdC5ydW50aW1lSHlwZXJ0eVVSTH0gaHlwZXJ0eT17cmVzdWx0Lmluc3RhbmNlfSAvPjtcbiAgICBSZWFjdERPTS5yZW5kZXIoZWxlbWVudCwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jvb3QnKSk7XG59XG4iXX0=
