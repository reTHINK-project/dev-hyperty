!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("activate",[],t):"object"==typeof exports?exports.activate=t():e.activate=t()}("undefined"!=typeof self?self:this,function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e,t,n,r){return{name:"UserAvailabilityObserver",instance:new o(e,t,n,r)}};var o=function(){function e(t,n,r,o){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this._context=o.createContextObserver(t,n,r,["availability_context"])}return function(e,t,n){t&&r(e.prototype,t),n&&r(e,n)}(e,[{key:"start",value:function(){return this._context.start([{value:"unavailable"}],function(e){console.log("[UserAvailabilityObserver.onDisconnected]: ",e),e.data.values[0].value="unavailable",e.sync()})}},{key:"resumeDiscoveries",value:function(){return this._context.resumeDiscoveries()}},{key:"onResumeObserver",value:function(e){return this._context.onResumeObserver(e)}},{key:"discoverUsers",value:function(e,t){return this._context.discoverUsers(e,t)}},{key:"observe",value:function(e){return this._context.observe(e)}},{key:"unobserve",value:function(e){return this._context.unobserve(e)}}]),e}()}]).default});