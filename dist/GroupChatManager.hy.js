!function(e,r){"object"==typeof exports&&"object"==typeof module?module.exports=r():"function"==typeof define&&define.amd?define("activate",[],r):"object"==typeof exports?exports.activate=r():e.activate=r()}("undefined"!=typeof self?self:this,function(){return function(e){var r={};function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=0)}([function(e,r,t){(function(e){var t,n,o;function a(e){return(a="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}!function(i,u){"object"==a(r)&&"object"==a(e)?e.exports=u():(n=[],void 0===(o="function"==typeof(t=u)?t.apply(r,n):t)||(e.exports=o))}("undefined"!=typeof self&&self,function(){return function(e){var r={};function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}return t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=0)}([function(e,r,t){"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n=t(1);function o(e,r){for(var t=0;t<r.length;t++){var n=r[t];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}var a=function(){function e(){!function(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}(this,e)}return function(e,r,t){r&&o(e.prototype,r)}(e,[{key:"_start",value:function(e,r,t,n){var o=this;o._factory=n,o._syncher=n.createSyncher(e,r,t),o._manager=n.createChatManager(e,r,t,o._syncher),o.discovery=o._manager.discovery,o.identityManager=o._manager.identityManager,o.search=o._manager.search,o._domain=o._manager._domain,o._myUrl=e,o.hypertyURL=e,o._runtimeURL=t.runtimeURL,o._bus=r,o._backup=!!t.hasOwnProperty("backup")&&t.backup,o._heartbeat=t.hasOwnProperty("heartbeat")?t.heartbeat:void 0,o._syncher.onNotification(function(e){console.log("[GroupChatManager] onNotification:",e),o.processNotification(e)}),o._resumeReporters(),o._resumeObservers()}},{key:"register",value:function(e,r,t){var n={userProfile:{guid:t.guid,userURL:t.userURL,info:{code:r}}},o={type:"forward",to:e,from:this.hypertyURL,identity:n,body:{type:"create",from:this.hypertyURL,identity:n}};this._bus.postMessage(o)}},{key:"_getRegisteredUser",value:function(){var e=this;return new Promise(function(r,t){e._manager.currentIdentity?r(e._manager.currentIdentity):e._manager.identityManager.discoverUserRegistered().then(function(e){console.log("[GroupChatManager] GET MY IDENTITY:",e),r(e)}).catch(function(e){console.error("[GroupChatManager] ERROR:",e),t(e)})})}},{key:"_resumeReporters",value:function(){var e=this,r=this;r._syncher.resumeReporters({store:!0}).then(function(t){var n=Object.keys(t);n.length>0&&r._getRegisteredUser().then(function(o){n.forEach(function(n){console.log("[GroupChatManager.resumeReporter]: ",n);var a=r._factory.createChatController(r._syncher,r.discovery,r._domain,r.search,o,r._manager);a.dataObjectReporter=t[n],e._manager._reportersControllers[n]=a,r._resumeInterworking(a.dataObjectReporter),console.log("[GroupChatManager] chatController invitationsHandler: ",a.invitationsHandler),a.invitationsHandler.resumeDiscoveries(r._manager.discovery,a.dataObjectReporter)}),r._onResumeReporter&&r._onResumeReporter(e._manager._reportersControllers)})}).catch(function(e){console.info("[GroupChatManager.resumeReporters] :",e)})}},{key:"_resumeObservers",value:function(){var e=this,r=this;r._syncher.resumeObservers({store:!0}).then(function(t){console.log("[GroupChatManager] resuming observers : ",t,r,r._onResume);var n=Object.keys(t);n.length>0&&r._getRegisteredUser().then(function(o){n.forEach(function(n){console.log("[GroupChatManager].syncher.resumeObserver: ",n);var a=t[n],i=r._factory.createChatController(r._syncher,r._manager.discovery,r._domain,r.search,o,r._manager);i.dataObjectObserver=a,e._manager._observersControllers[n]=i;var u=r._factory.createRegistrationStatus(a.url,r._runtimeURL,r._myUrl,r._bus);!function e(r,t,n){var o=n;r.sync().then(function(n){n||o.onLive(t,function(){o.unsubscribeLive(t),e(r,t,o)})})}(a,r._myUrl,u)}),r._onResumeObserver&&r._onResumeObserver(e._manager._observersControllers)})}).catch(function(e){console.info("[GroupChatManager] Resume Observer | ",e)})}},{key:"_resumeInterworking",value:function(e){var r=this;if(e.data.participants){var t=e.data.participants,n=e.url,o=e.schema;console.log("[GroupChatManager._resumeInterworking for] ",t),Object.keys(t).forEach(function(a){var i=t[a].identity.userProfile.userURL.split("://");if("user"!==i[0]){console.log("[GroupChatManager._resumeInterworking for] ",a),i=i[0]+"://"+i[1].split("/")[1];var u={type:"create",from:r._myUrl,to:i,body:{resource:n,schema:o,value:e.metadata}};r._bus.postMessage(u,function(){})}})}}},{key:"create",value:function(e,r){var t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};return t.backup=this._backup,t.heartbeat=this._heartbeat,console.log("[GroupChatManager.create] extra: ",t),this._manager.create(e,r,t)}},{key:"onInvitation",value:function(e){return this._manager.onInvitation(e)}},{key:"onResumeReporter",value:function(e){this._onResumeReporter=e}},{key:"onResumeObserver",value:function(e){this._onResumeObserver=e}},{key:"join",value:function(e){return this._manager.join(e)}},{key:"myIdentity",value:function(e){return console.log("[GroupChatManager.myIdentity] ",e),this._manager.myIdentity(e)}},{key:"processNotification",value:function(e){return this._manager.processNotification(e)}},{key:"onInvitation",value:function(e){return this._manager.onInvitation(e)}},{key:"name",get:function(){return n.a.name}},{key:"descriptor",get:function(){return console.log("[Connector.getDescriptor]"),n.a}},{key:"runtimeHypertyURL",get:function(){return this.hypertyURL}}]),e}();r.default=a},function(e,r,t){"use strict";t.d(r,"a",function(){return n});var n={name:"GroupChatManager",language:"javascript",signature:"",configuration:{},hypertyType:["chat"],constraints:{browser:!0},dataObjects:["https://catalogue.%domain%/.well-known/dataschema/Communication"]}}]).default})}).call(r,t(1)(e))},function(e,r){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),e.webpackPolyfill=1),e}}]).default});