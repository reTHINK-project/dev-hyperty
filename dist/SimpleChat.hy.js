!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("activate",[],t):"object"==typeof exports?exports.activate=t():e.activate=t()}("undefined"!=typeof self?self:this,function(){return function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}return r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:n})},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=r(1);function o(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}var a=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e)}return function(e,t,r){t&&o(e.prototype,t),r&&o(e,r)}(e,[{key:"_start",value:function(e,t,r,n){var o=this;o._factory=n,o._syncher=n.createSyncher(e,t,r),o._manager=n.createSimpleChatManager(e,t,r,o._syncher),o.discovery=o._manager.discovery,o.identityManager=o._manager.identityManager,o._domain=o._manager._domain,o._myUrl=e,o.hypertyURL=e,o._runtimeURL=r.runtimeURL,o._bus=t,o._syncher.onNotification(function(e){console.log("[SimpleChat] onNotification: ",e),o.processNotification(e)}),console.log("[SimpleChat] configuration ",r),o._manager.offline=!!r.offline&&r.offline,o._manager.backup=!!r.backup&&r.backup}},{key:"resume",value:function(){console.log("[SimpleChat.resume] "),this._resumeReporters(),this._resumeObservers()}},{key:"register",value:function(e,t){var r=this;r._manager.identityManager.discoverUserRegistered().then(function(n){var o={userProfile:{guid:n.guid,userURL:n.userURL,info:{code:t}}},a={type:"forward",to:e,from:r.hypertyURL,identity:o,body:{type:"create",from:r.hypertyURL,identity:o}};r._bus.postMessage(a)}).catch(function(e){console.error("[SimpleChat] ERROR:",e),reject(e)})}},{key:"newParticipant",value:function(e,t,r){var n=this;n._manager.identityManager.discoverUserRegistered().then(function(o){console.log("[SimpleChat] GET MY IDENTITY:",o);var a={type:"forward",to:"".concat(e,"/tickets"),from:r,identity:o,body:{type:"update",from:r,identity:o,status:"new-participant",participant:t}};n._bus.postMessage(a)}).catch(function(e){console.error("[SimpleChat] ERROR:",e),reject(e)})}},{key:"closeTicket",value:function(e,t,r){var n=this;n._manager.identityManager.discoverUserRegistered().then(function(o){var a={type:"forward",to:"".concat(e,"/tickets"),from:r,identity:o,body:{type:"update",from:r,identity:o,status:"closed",participant:t}};n._bus.postMessage(a)}).catch(function(e){console.error("[SimpleChat] ERROR:",e),reject(e)})}},{key:"_getRegisteredUser",value:function(){var e=this;return new Promise(function(t,r){e._manager.currentIdentity?t(e._manager.currentIdentity):e._manager.identityManager.discoverUserRegistered().then(function(e){console.log("[SimpleChat] GET MY IDENTITY:",e),t(e)}).catch(function(e){console.error("[SimpleChat] ERROR:",e),r(e)})})}},{key:"_resumeReporters",value:function(){var e=this,t=this;t._syncher.resumeReporters({store:!0}).then(function(r){var n=Object.keys(r);n.length>0&&t._getRegisteredUser().then(function(o){n.forEach(function(n){console.log("[SimpleChat.resumeReporter]: ",n);var a=t._factory.createChat(t._syncher,t._domain,o,t._manager);a.dataObjectReporter=r[n],e._manager._reportersControllers[n]=a,t._resumeInterworking(a.dataObjectReporter),console.log("[SimpleChat] chatController invitationsHandler: ",a.invitationsHandler),t._syncher.read(n).then(function(e){a.dataObjectReporter=e})}),t._onResumeReporter&&t._onResumeReporter(e._manager._reportersControllers)})}).catch(function(e){console.info("[SimpleChat.resumeReporters] :",e)})}},{key:"_resumeObservers",value:function(){var e=this,t=this;t._syncher.resumeObservers({store:!0}).then(function(r){console.log("[SimpleChat] resuming observers : ",r,t,t._onResume);var n=Object.keys(r);n.length>0&&t._getRegisteredUser().then(function(o){n.forEach(function(n){console.log("[SimpleChat].syncher.resumeObserver: ",n);var a=r[n],i=t._factory.createChat(t._syncher,t._domain,o,t._manager);i.dataObjectObserver=a,e._manager._observersControllers[n]=i,t._syncher.read(n).then(function(e){i.dataObjectObserver=e})}),t._onResumeObserver&&t._onResumeObserver(e._manager._observersControllers)})}).catch(function(e){console.info("[SimpleChat] Resume Observer | ",e)})}},{key:"_resumeInterworking",value:function(e){var t=this;if(e.data.participants){var r=e.data.participants,n=e.url,o=e.schema;console.log("[SimpleChat._resumeInterworking for] ",r),Object.keys(r).forEach(function(a){var i=r[a].identity.userProfile.userURL.split("://");if("user"!==i[0]){console.log("[SimpleChat._resumeInterworking for] ",a),i=i[0]+"://"+i[1].split("/")[1];var s={type:"create",from:t._myUrl,to:i,body:{resource:n,schema:o,value:e.metadata}};t._bus.postMessage(s,function(){})}})}}},{key:"create",value:function(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{mutual:!1,domain_registration:!1,reuseURL:!0};return this._manager.create(e,t,r)}},{key:"onInvitation",value:function(e){return this._manager.onInvitation(e)}},{key:"onResumeReporter",value:function(e){this._onResumeReporter=e}},{key:"onResumeObserver",value:function(e){this._onResumeObserver=e}},{key:"join",value:function(e){return this._manager.join(e,!1)}},{key:"myIdentity",value:function(e){return console.log("[SimpleChat.myIdentity] ",e),this._manager.myIdentity(e)}},{key:"processNotification",value:function(e){return this._manager.processNotification(e)}},{key:"onInvitation",value:function(e){return this._manager.onInvitation(e)}},{key:"name",get:function(){return n.a.name}},{key:"descriptor",get:function(){return n.a}},{key:"runtimeHypertyURL",get:function(){return this._myUrl}}]),e}();t.default=a},function(e,t,r){"use strict";r.d(t,"a",function(){return n});var n={name:"SimpleChat",language:"javascript",signature:"",configuration:{backup:!0,heartBeat:60,offline:"hyperty://sharing-cities-dsm/offline-sub-mgr"},hypertyType:["chat"],constraints:{browser:!0},dataObjects:["https://catalogue.%domain%/.well-known/dataschema/Communication"]}}]).default});