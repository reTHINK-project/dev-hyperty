!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("activate",[],t):"object"==typeof exports?exports.activate=t():e.activate=t()}("undefined"!=typeof self?self:this,function(){return function(e){var t={};function r(o){if(t[o])return t[o].exports;var n=t[o]={i:o,l:!1,exports:{}};return e[o].call(n.exports,n,n.exports,r),n.l=!0,n.exports}return r.m=e,r.c=t,r.d=function(e,t,o){r.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:o})},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=r(1);function n(e,t){for(var r=0;r<t.length;r++){var o=t[r];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}var a={name:"HelloWorldReporter",language:"javascript",signature:"",configuration:{},constraints:{browser:!0},hypertyType:["hello"],dataObjects:["https://%domain%/.well-known/dataschema/HelloWorldDataSchema"]},c=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e)}return function(e,t,r){t&&n(e.prototype,t),r&&n(e,r)}(e,[{key:"_start",value:function(e,t,r,o){if(!e)throw new Error("The hypertyURL is a needed parameter");if(!t)throw new Error("The MiniBus is a needed parameter");if(!r)throw new Error("The configuration is a needed parameter");if(!o)throw new Error("The factory is a needed parameter");var n=o.divideURL(e).domain;this._domain=n,this._objectDescURL="hyperty-catalogue://catalogue."+n+"/.well-known/dataschema/HelloWorldDataSchema",this._factory=o,this._backup=!!r.hasOwnProperty("backup")&&r.backup,console.log("HelloWorldReporter configuration",r);var a=this._factory.createSyncher(e,t,r);this._syncher=a}},{key:"hello",value:function(e){var t=this,r=t._syncher;return new Promise(function(n,a){var c=Object.assign({resources:["hello"]},{});c.backup=t._backup,c.reuseURL=!0,c.mutual=!1,c.domain_registration=!1,r.create(t._objectDescURL,[e],o.a,!0,!1,"hello",{},c).then(function(e){console.info("1. Return Created Hello World Data Object Reporter",e),t.helloObjtReporter=e,t.prepareDataObjectReporter(e),n(e)}).catch(function(e){console.error(e),a(e)})})}},{key:"prepareDataObjectReporter",value:function(e){e.onSubscription(function(e){console.info("-------- Hello World Reporter received subscription request --------- \n"),e.accept()}),e.onRead(function(e){e.accept()})}},{key:"bye",value:function(e){console.log("bye:",this.helloObjtReporter),this.helloObjtReporter.data.hello=e||"bye, bye"}},{key:"onReporterResume",value:function(e){this._onReporterResume=e}},{key:"descriptor",get:function(){return a}},{key:"name",get:function(){return a.name}}]),e}();t.default=c},function(e,t,r){"use strict";t.a={name:"hello",hello:"Hello buddy!!"}}]).default});