!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("activate",[],t):"object"==typeof exports?exports.activate=t():e.activate=t()}("undefined"!=typeof self?self:this,function(){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var r=t[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:o})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=n(1);function r(e){return(r="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function a(e,t){return!t||"object"!==r(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}function c(e){return(c=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function u(e,t){return(u=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var s={name:"HelloWorldObserver",language:"javascript",signature:"",configuration:{},constraints:{browser:!0},hypertyType:["hello"],dataObjects:["https://%domain%/.well-known/dataschema/HelloWorldDataSchema"]},f=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),a(this,c(t).call(this))}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&u(e,t)}(t,o["a"]),function(e,t,n){t&&i(e.prototype,t),n&&i(e,n)}(t,[{key:"_start",value:function(e,t,n,o){if(!e)throw new Error("The hypertyURL is a needed parameter");if(!t)throw new Error("The MiniBus is a needed parameter");if(!n)throw new Error("The configuration is a needed parameter");if(!o)throw new Error("The factory is a needed parameter");var r=this,i=o.divideURL(e).domain;r._domain=i,r._objectDescURL="hyperty-catalogue://catalogue."+i+"/.well-known/dataschema/HelloWorldDataSchema";var a=o.createSyncher(e,t,n);a.onNotification(function(e){r._onNotification(e)}),a.resumeObservers({}).then(function(e){e&&(console.log("[hyperty syncher resume] - dataObject",e),Object.values(e).forEach(function(e){r._changes(e),e.sync()}))}).catch(function(e){console.log("[hyperty syncher resume] - ",e)}),r._syncher=a}},{key:"hello",value:function(){console.log("Hello World !")}},{key:"_onNotification",value:function(e){var t=this;console.info("Event Received: ",e),t.trigger("invitation",e.identity),e.ack();var n={schema:t._objectDescURL,resource:e.url,store:!0,p2p:!1,mutual:!1};t._syncher.subscribe(n).then(function(e){console.info(e),console.log("[hyperty syncher subscribe] - dataObject",e),t._changes(e)}).catch(function(e){console.error(e)})}},{key:"_changes",value:function(e){var t=this;console.log("[hyperty syncher] - dataObject",e),this.trigger("hello",e.data),e.onChange("*",function(n){console.info("message received:",n),"hello"===n.field&&t.trigger("hello",e.data)})}},{key:"descriptor",get:function(){return s}},{key:"name",get:function(){return s.name}}]),t}();t.default=f},function(e,t,n){"use strict";function o(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}var r=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.__eventListeners={}}return function(e,t,n){t&&o(e.prototype,t),n&&o(e,n)}(e,[{key:"addEventListener",value:function(e,t){void 0!=t&&(this.__eventListeners[e]?this.__eventListeners[e].push(t):this.__eventListeners[e]=[t])}},{key:"trigger",value:function(e,t){var n=this.__eventListeners[e];n&&n.forEach(function(n){try{n(t)}catch(o){console.warn("calling listener "+n.name+" for event type "+e+" with parameters '"+t+"' resulted in an error!",o)}})}}]),e}();t.a=r}]).default});