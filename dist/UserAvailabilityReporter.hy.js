!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("activate",[],e):"object"==typeof exports?exports.activate=e():t.activate=e()}("undefined"!=typeof self?self:this,function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:r})},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){(function(t){var n,r,o;function i(t){return(i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}!function(a,c){"object"==i(e)&&"object"==i(t)?t.exports=c():(r=[],void 0===(o="function"==typeof(n=c)?n.apply(e,r):n)||(t.exports=o))}("undefined"!=typeof self&&self,function(){return function(t){var e={};function n(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{configurable:!1,enumerable:!0,get:r})},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=n(1),o=n(2);function i(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}var a=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t)}return function(t,e,n){e&&i(t.prototype,e)}(t,[{key:"_start",value:function(t,e,n,r){var o=this;this.hypertyURL=t,this._context=r.createContextReporter(t,e,n),console.info("[UserAvailabilityReporter] started with url: ",t),this.identityManager=r.createIdentityManager(t,n.runtimeURL,e),this.context.syncher.onNotification(function(t){o.context.processNotification(t)})}},{key:"start",value:function(){var t=this;return new Promise(function(e,n){console.log("[UserAvailabilityReporter.starting]"),t.context.syncher.resumeReporters({store:!0}).then(function(n){if(Object.keys(n).length>0)t.context.contexts.myAvailability=t._filterResumedContexts(n),console.log("[UserAvailabilityReporter.start] resuming ",t.context.contexts.myAvailability),t.context._onSubscription(t.context.contexts.myAvailability),e(t.context.contexts.myAvailability);else{console.log("[UserAvailabilityReporter.start] nothing to resume ",n);var r="myAvailability";e(t.create(r,Object(o.a)(),["availability_context"],r))}}).catch(function(t){console.error("[UserAvailabilityReporter] Resume failed | ",t)})}).catch(function(t){reject("[UserAvailabilityReporter] Start failed | ",t)})}},{key:"_filterResumedContexts",value:function(t){var e=this;return Object.keys(t).filter(function(n){return t[n].metadata.reporter===e.context.syncher._owner}).reduce(function(e,n){return Date.parse(t[n].metadata.lastModified)>0&&(e=t[n]),e},{})}},{key:"onResumeReporter",value:function(t){this.context._onResumeReporter=t}},{key:"create",value:function(t,e,n){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"myContext";return this.context.create(t,e,n,r)}},{key:"setStatus",value:function(t){var e=[{value:t}];return this._context.setContext("myAvailability",e)}},{key:"name",get:function(){return r.a.name}},{key:"descriptor",get:function(){return r.a}},{key:"runtimeHypertyURL",get:function(){return this.hypertyURL}},{key:"context",get:function(){return this._context}}]),t}();e.default=a},function(t,e,n){"use strict";n.d(e,"a",function(){return r});var r={name:"UserAvailabilityReporter",configuration:{expires:3600},hypertyType:["availability_context"],constraints:{browser:!0},language:"javascript",signature:"",dataObjects:["https://catalogue.%domain%/.well-known/dataschema/ContextReporter"]}},function(t,e,n){"use strict";e.a=function(){return Object.assign({},{id:"_"+Math.random().toString(36).substr(2,9),values:[{name:"availability",type:"availability_status",unit:"pres",value:"available"}]})}}]).default})}).call(e,n(1)(t))},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t}}]).default});