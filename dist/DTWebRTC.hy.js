!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("activate",[],t):"object"==typeof exports?exports.activate=t():e.activate=t()}("undefined"!=typeof self?self:this,function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){(function(e){var n,r,i;function o(e){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}!function(a,c){"object"==o(t)&&"object"==o(e)?e.exports=c():(r=[],void 0===(i="function"==typeof(n=c)?n.apply(t,r):n)||(e.exports=i))}("undefined"!=typeof self&&self,function(){return function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:r})},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=n(1),i=n(2),a=n(3);function c(e){return(c="function"==typeof Symbol&&"symbol"==o(Symbol.iterator)?function(e){return o(e)}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":o(e)})(e)}function s(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function d(e){return(d=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function u(e,t){return(u=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}n.n(a);var l=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),function(e,t){return!t||"object"!==c(t)&&"function"!=typeof t?function(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}(e):t}(this,d(t).call(this))}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&u(e,t)}(t,r.a),function(e,t,n){t&&s(e.prototype,t)}(t,[{key:"_start",value:function(e,t,n,r){var i=this;if(!e)throw new Error("The hypertyURL is a needed parameter");if(!t)throw new Error("The MiniBus is a needed parameter");if(!n)throw new Error("The configuration is a needed parameter");this._domain=r.divideURL(e).domain,this._objectDescURL="hyperty-catalogue://catalogue."+this._domain+"/.well-known/dataschema/Connection",this._syncher=r.createSyncher(e,t,n),this.discovery=r.createDiscovery(e,n.runtimeURL,t),console.log("[DTWebRTC] [constructor] >>>>> Discovery object is:",this.discovery);var o=r.createIdentityManager(e,n.runtimeURL,t);this.search=r.createSearch(this.discovery,o),this.objObserver,this.objReporter,this.callerIdentity,this.constraints={audio:!0,video:!0},this.receivingConstraints={offerToReceiveAudio:1,offerToReceiveVideo:1},this.sender=null,this.myUrl=e,this.partner=null,this.pc=null,this.mediaStream=null,this.iceconfig=n,this._syncher.onNotification(function(e){i._onNotification(e)})}},{key:"_onNotification",value:function(e){var t=this;switch(null==this.sender&&(this.sender=!1),console.info("[DTWebRTC]: Event Received: ",e),e.type){case"create":this.createPC(),this.callerIdentity=e.identity,console.info("[DTWebRTC]: [_onNotification] sending event.ack() ");var n=e.ack();console.info("[DTWebRTC]: [_onNotification] event.ack() result is:",n),setTimeout(function(){var n={schema:t._objectDescURL,resource:e.url};t._syncher.subscribe(n).then(function(n){console.info("[DTWebRTC]: [_onNotification] objObserver ",n),t.objObserver=n,t.sender||(t.partner=e.from,console.log("got invite"),t.trigger("incomingcall",t.callerIdentity)),t.handleObserverObject(n)}).catch(function(e){console.error(e)})},750);break;case"delete":this.cleanupPC(),this.trigger("disconnected")}}},{key:"connect",value:function(e){var t=this;return this.partner=e,null==this.sender&&(this.sender=!0),new Promise(function(n,r){var i={name:"Connection",status:"",owner:t.myUrl,connectionDescription:{},iceCandidates:[]};t._syncher.create(t._objectDescURL,[e],i,!0,!1,"call",{},{resources:["audio","video"]}).then(function(e){console.info("1. Return Created WebRTC Object Reporter",e),t.objReporter=e,t.sender&&t.invite().then(function(e){t.objReporter.data.connectionDescription=e}),e.onSubscription(function(t){console.info("-------- Receiver received subscription request --------- \n"),t.accept(),n(e)})}).catch(function(e){console.error(e),r(e)})})}},{key:"setMediaOptions",value:function(e){this.constraints=e}},{key:"invite",value:function(){var e=this;return this.createPC(),new Promise(function(t,n){console.log(">>>Constraints",e.constraints),navigator.mediaDevices.getUserMedia(e.constraints).then(function(r){console.log("[DTWebRTC]: localviodeo"),e.trigger("localvideo",r),e.mediaStream=r,e.pc.addStream(r),e.pc.createOffer().then(function(r){e.pc.setLocalDescription(new RTCSessionDescription(r),function(){t(r)},function(){n()})}).catch(function(e){n("Create Offer failed: ",e)})})})}},{key:"acceptCall",value:function(){var e=this;this.objObserver.data&&this.objObserver.data.connectionDescription?(console.log("[DTWebRTC]: >>>Constraints",this.constraints),navigator.mediaDevices.getUserMedia(this.constraints).then(function(t){e.trigger("localvideo",t),e.mediaStream=t,e.pc.addStream(t),e.connect(e.partner).then(function(t){console.log("[DTWebRTC]: objReporter created successfully: ",t),e.objReporter=t,e.pc.createAnswer().then(function(t){e.objReporter.data.connectionDescription=t,e.pc.setLocalDescription(new RTCSessionDescription(t),function(){console.log("[DTWebRTC]: localDescription (answer) successfully set: ",t)},function(e){console.log("Error in setLocalDescription: "+e)})})})})):console.log("[DTWebRTC]: offer was't set in the invitation - data: ",data)}},{key:"setIceServer",value:function(e,t){this.iceconfig.ice=t?e:e.concat(this.iceconfig.ice)}},{key:"createPC",value:function(){var e=this;this.pc||(this.pc=new RTCPeerConnection(this.iceconfig),console.log("[DTWebRTC]: created PeerConnection",this.pc),this.pc.onaddstream=function(t){console.log("[DTWebRTC]: >>>onaddstream",e.pc),e.trigger("remotevideo",t.stream)},this.pc.onicecandidate=function(t){if(console.log("[DTWebRTC]: icecandidateevent occured: ",t),t.candidate){var n={type:"candidate",candidate:t.candidate.candidate,sdpMid:t.candidate.sdpMid,sdpMLineIndex:t.candidate.sdpMLineIndex},r=e.objReporter.data,i=JSON.parse(JSON.stringify(r.iceCandidates));i.push(n),e.objReporter.data.iceCandidates=i}},this.pc.onRemoteStreamRemoved=function(e){console.log(">>>stream removed from remote",e)})}},{key:"handleObserverObject",value:function(e){var t=this,n=e.data;console.info("[DTWebRTC]: handleObserverObject Peer Data:",n),n.hasOwnProperty("connectionDescription")&&this.processPeerInformation(n.connectionDescription),n.hasOwnProperty("iceCandidates")&&n.iceCandidates.forEach(function(e){console.log("[DTWebRTC]: handleObserverObject for ice",e),t.processPeerInformation(e)}),e.onChange("*",function(e){console.debug("[DTWebRTC]: Observer on change message: ",e),e.data[0]?(console.log(">>event.data[0]",e.data[0]),t.processPeerInformation(e.data[0])):(console.log("[DTWebRTC]: >>event",e),t.processPeerInformation(e.data))})}},{key:"processPeerInformation",value:function(e){console.info("[DTWebRTC]: processPeerInformation: ",JSON.stringify(e)),this.pc?("offer"!==e.type&&"answer"!==e.type||(console.info("[DTWebRTC]: Process Connection Description: ",e),this.pc.setRemoteDescription(new RTCSessionDescription(e)).then(function(){console.log("[DTWebRTC]: remote success")},function(e){console.log("[DTWebRTC]: setRemoteDescription error: ",e)})),e.candidate&&(console.info("Process Ice Candidate: ",e),this.pc.addIceCandidate(new RTCIceCandidate({candidate:e.candidate})))):console.info("[DTWebRTC]: processPeerInformation: no PeerConnection existing --\x3e maybe in disconnecting process. --\x3e ignoring this update")}},{key:"cleanupPC",value:function(){this.sender=null,this.mediaStream&&this.pc&&this.mediaStream.getTracks().forEach(function(e){e.stop()}),this.pc&&this.pc.close(),this.pc=null}},{key:"disconnect",value:function(){var e=this;return console.log("[DTWebRTC]>>>lets disconnect",this),new Promise(function(t,n){try{e.objReporter&&e.objReporter.delete(),e.objObserver&&e.objObserver.delete(),e.cleanupPC(),e.trigger("disconnected"),t()}catch(e){n(e)}})}},{key:"switchLocalAudio",value:function(e){console.log("[DTWebRTC] --\x3e setting local audio to: "+e);try{this.mediaStream.getAudioTracks()[0].enabled=e}catch(e){console.err("error while (un)muting local audio state!")}}},{key:"switchLocalVideo",value:function(e){console.log("[DTWebRTC] --\x3e setting local video to: "+e);try{this.mediaStream.getVideoTracks()[0].enabled=e}catch(e){console.err("error while (un)muting local video state!")}}},{key:"name",get:function(){return i.a.name}},{key:"descriptor",get:function(){return i.a}},{key:"runtimeHypertyURL",get:function(){return this.myUrl}}]),t}();t.default=l},function(e,t,n){"use strict";function r(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}var i=function(){function e(){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.__eventListeners={}}return function(e,t,n){t&&r(e.prototype,t)}(e,[{key:"addEventListener",value:function(e,t){void 0!=t&&(this.__eventListeners[e]?this.__eventListeners[e].push(t):this.__eventListeners[e]=[t])}},{key:"trigger",value:function(e,t){var n=this.__eventListeners[e];n&&n.forEach(function(n){try{n(t)}catch(r){console.warn("calling listener "+n.name+" for event type "+e+" with parameters '"+t+"' resulted in an error!",r)}})}}]),e}();t.a=i},function(e,t,n){"use strict";n.d(t,"a",function(){return r});var r={name:"DTWebRTC",configuration:{iceServers:[{urls:"turn:numb.viagenie.ca",credential:"zJcH3erd9cUv5Zh",username:"luis-t-duarte@telecom.pt"},{urls:["stun:stun.voiparound.com","stun:stun.voipbuster.com","stun:stun.voipstunt.com","stun:stun.voxgratia.org","stun:stun.ekiga.net","stun:stun.schlund.de","stun:stun.iptel.org","stun:stun.l.google.com:19302","stun:stun1.l.google.com:19302","stun:stun.ideasip.com","stun:stun4.l.google.com:19302","stun:stun2.l.google.com:19302","stun:stun3.l.google.com:19302"]}],iceTransportPolicy:"all"},constraints:{browser:!0,windowSandbox:!0,mic:!0,camera:!0},hypertyType:["audio","video"],dataObjects:["https://catalogue.%domain%/.well-known/dataschema/Connection"]}},function(e,t,n){"use strict";var r=null,i=null,a=null,c=null,s=null,d=null,u={log:function(){},extractVersion:function(e,t,n){var r=e.match(t);return r&&r.length>=n&&parseInt(r[n],10)}};if("object"==("undefined"==typeof window?"undefined":o(window))&&(!window.HTMLMediaElement||"srcObject"in window.HTMLMediaElement.prototype||Object.defineProperty(window.HTMLMediaElement.prototype,"srcObject",{get:function(){return"mozSrcObject"in this?this.mozSrcObject:this._srcObject},set:function(e){"mozSrcObject"in this?this.mozSrcObject=e:(this._srcObject=e,this.src=URL.createObjectURL(e))}}),r=window.navigator&&window.navigator.getUserMedia),i=function(e,t){e.srcObject=t},a=function(e,t){e.srcObject=t.srcObject},"undefined"!=typeof window&&window.navigator)if(navigator.mozGetUserMedia){if(u.log("This appears to be Firefox"),c="firefox",s=u.extractVersion(navigator.userAgent,/Firefox\/([0-9]+)\./,1),d=31,window.RTCPeerConnection||(window.RTCPeerConnection=function(e,t){if(s<38&&e&&e.iceServers){for(var n=[],r=0;r<e.iceServers.length;r++){var i=e.iceServers[r];if(i.hasOwnProperty("urls"))for(var o=0;o<i.urls.length;o++){var a={url:i.urls[o]};0===i.urls[o].indexOf("turn")&&(a.username=i.username,a.credential=i.credential),n.push(a)}else n.push(e.iceServers[r])}e.iceServers=n}return new mozRTCPeerConnection(e,t)},window.RTCPeerConnection.prototype=mozRTCPeerConnection.prototype,mozRTCPeerConnection.generateCertificate&&Object.defineProperty(window.RTCPeerConnection,"generateCertificate",{get:function(){return arguments.length?mozRTCPeerConnection.generateCertificate.apply(null,arguments):mozRTCPeerConnection.generateCertificate}}),window.RTCSessionDescription=mozRTCSessionDescription,window.RTCIceCandidate=mozRTCIceCandidate),r=function(e,t,n){var r=function(e){if("object"!=o(e)||e.require)return e;var t=[];return Object.keys(e).forEach(function(n){if("require"!==n&&"advanced"!==n&&"mediaSource"!==n){var r=e[n]="object"==o(e[n])?e[n]:{ideal:e[n]};if(void 0===r.min&&void 0===r.max&&void 0===r.exact||t.push(n),void 0!==r.exact&&("number"==typeof r.exact?r.min=r.max=r.exact:e[n]=r.exact,delete r.exact),void 0!==r.ideal){e.advanced=e.advanced||[];var i={};"number"==typeof r.ideal?i[n]={min:r.ideal,max:r.ideal}:i[n]=r.ideal,e.advanced.push(i),delete r.ideal,Object.keys(r).length||delete e[n]}}}),t.length&&(e.require=t),e};return s<38&&(u.log("spec: "+JSON.stringify(e)),e.audio&&(e.audio=r(e.audio)),e.video&&(e.video=r(e.video)),u.log("ff37: "+JSON.stringify(e))),navigator.mozGetUserMedia(e,t,n)},navigator.getUserMedia=r,navigator.mediaDevices||(navigator.mediaDevices={getUserMedia:g,addEventListener:function(){},removeEventListener:function(){}}),navigator.mediaDevices.enumerateDevices=navigator.mediaDevices.enumerateDevices||function(){return new Promise(function(e){e([{kind:"audioinput",deviceId:"default",label:"",groupId:""},{kind:"videoinput",deviceId:"default",label:"",groupId:""}])})},s<41){var l=navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);navigator.mediaDevices.enumerateDevices=function(){return l().then(void 0,function(e){if("NotFoundError"===e.name)return[];throw e})}}}else if(navigator.webkitGetUserMedia&&window.webkitRTCPeerConnection){u.log("This appears to be Chrome"),c="chrome",s=u.extractVersion(navigator.userAgent,/Chrom(e|ium)\/([0-9]+)\./,2),d=38,window.RTCPeerConnection=function(e,t){e&&e.iceTransportPolicy&&(e.iceTransports=e.iceTransportPolicy);var n=new webkitRTCPeerConnection(e,t),r=n.getStats.bind(n);return n.getStats=function(e,t,n){var i=this,o=arguments;if(arguments.length>0&&"function"==typeof e)return r(e,t);var a=function(e){var t={};return e.result().forEach(function(e){var n={id:e.id,timestamp:e.timestamp,type:e.type};e.names().forEach(function(t){n[t]=e.stat(t)}),t[n.id]=n}),t};return arguments.length>=2?r.apply(this,[function(e){o[1](a(e))},arguments[0]]):new Promise(function(t,n){1===o.length&&null===e?r.apply(i,[function(e){t.apply(null,[a(e)])},n]):r.apply(i,[t,n])})},n},window.RTCPeerConnection.prototype=webkitRTCPeerConnection.prototype,webkitRTCPeerConnection.generateCertificate&&Object.defineProperty(window.RTCPeerConnection,"generateCertificate",{get:function(){return arguments.length?webkitRTCPeerConnection.generateCertificate.apply(null,arguments):webkitRTCPeerConnection.generateCertificate}}),["createOffer","createAnswer"].forEach(function(e){var t=webkitRTCPeerConnection.prototype[e];webkitRTCPeerConnection.prototype[e]=function(){var e=this;if(arguments.length<1||1===arguments.length&&"object"==o(arguments[0])){var n=1===arguments.length?arguments[0]:void 0;return new Promise(function(r,i){t.apply(e,[r,i,n])})}return t.apply(this,arguments)}}),["setLocalDescription","setRemoteDescription","addIceCandidate"].forEach(function(e){var t=webkitRTCPeerConnection.prototype[e];webkitRTCPeerConnection.prototype[e]=function(){var e=arguments,n=this;return new Promise(function(r,i){t.apply(n,[e[0],function(){r(),e.length>=2&&e[1].apply(null,[])},function(t){i(t),e.length>=3&&e[2].apply(null,[t])}])})}});var p=function(e){if("object"!=o(e)||e.mandatory||e.optional)return e;var t={};return Object.keys(e).forEach(function(n){if("require"!==n&&"advanced"!==n&&"mediaSource"!==n){var r="object"==o(e[n])?e[n]:{ideal:e[n]};void 0!==r.exact&&"number"==typeof r.exact&&(r.min=r.max=r.exact);var i=function(e,t){return e?e+t.charAt(0).toUpperCase()+t.slice(1):"deviceId"===t?"sourceId":t};if(void 0!==r.ideal){t.optional=t.optional||[];var a={};"number"==typeof r.ideal?(a[i("min",n)]=r.ideal,t.optional.push(a),(a={})[i("max",n)]=r.ideal,t.optional.push(a)):(a[i("",n)]=r.ideal,t.optional.push(a))}void 0!==r.exact&&"number"!=typeof r.exact?(t.mandatory=t.mandatory||{},t.mandatory[i("",n)]=r.exact):["min","max"].forEach(function(e){void 0!==r[e]&&(t.mandatory=t.mandatory||{},t.mandatory[i(e,n)]=r[e])})}}),e.advanced&&(t.optional=(t.optional||[]).concat(e.advanced)),t};if(r=function(e,t,n){return e.audio&&(e.audio=p(e.audio)),e.video&&(e.video=p(e.video)),u.log("chrome: "+JSON.stringify(e)),navigator.webkitGetUserMedia(e,t,n)},navigator.getUserMedia=r,navigator.mediaDevices||(navigator.mediaDevices={getUserMedia:g,enumerateDevices:function(){return new Promise(function(e){var t={audio:"audioinput",video:"videoinput"};return MediaStreamTrack.getSources(function(n){e(n.map(function(e){return{label:e.label,kind:t[e.kind],deviceId:e.id,groupId:""}}))})})}}),navigator.mediaDevices.getUserMedia){var f=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=function(e){return u.log("spec:   "+JSON.stringify(e)),e.audio=p(e.audio),e.video=p(e.video),u.log("chrome: "+JSON.stringify(e)),f(e)}}else navigator.mediaDevices.getUserMedia=function(e){return g(e)};void 0===navigator.mediaDevices.addEventListener&&(navigator.mediaDevices.addEventListener=function(){u.log("Dummy mediaDevices.addEventListener called.")}),void 0===navigator.mediaDevices.removeEventListener&&(navigator.mediaDevices.removeEventListener=function(){u.log("Dummy mediaDevices.removeEventListener called.")}),i=function(e,t){s>=43?e.srcObject=t:void 0!==e.src?e.src=URL.createObjectURL(t):u.log("Error attaching stream to element.")},a=function(e,t){s>=43?e.srcObject=t.srcObject:e.src=t.src}}else if(navigator.mediaDevices&&navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)){if(u.log("This appears to be Edge"),c="edge",s=u.extractVersion(navigator.userAgent,/Edge\/(\d+).(\d+)$/,2),d=10547,window.RTCIceGatherer){var h=function(){return Math.random().toString(36).substr(2,10)},v=h(),m={splitLines:function(e){return e.trim().split("\n").map(function(e){return e.trim()})},splitSections:function(e){return e.split("\r\nm=").map(function(e,t){return(t>0?"m="+e:e).trim()+"\r\n"})},matchPrefix:function(e,t){return m.splitLines(e).filter(function(e){return 0===e.indexOf(t)})},parseCandidate:function(e){for(var t,n={foundation:(t=0===e.indexOf("a=candidate:")?e.substring(12).split(" "):e.substring(10).split(" "))[0],component:t[1],protocol:t[2].toLowerCase(),priority:parseInt(t[3],10),ip:t[4],port:parseInt(t[5],10),type:t[7]},r=8;r<t.length;r+=2)switch(t[r]){case"raddr":n.relatedAddress=t[r+1];break;case"rport":n.relatedPort=parseInt(t[r+1],10);break;case"tcptype":n.tcpType=t[r+1]}return n},writeCandidate:function(e){var t=[];t.push(e.foundation),t.push(e.component),t.push(e.protocol.toUpperCase()),t.push(e.priority),t.push(e.ip),t.push(e.port);var n=e.type;return t.push("typ"),t.push(n),"host"!==n&&e.relatedAddress&&e.relatedPort&&(t.push("raddr"),t.push(e.relatedAddress),t.push("rport"),t.push(e.relatedPort)),e.tcpType&&"tcp"===e.protocol.toLowerCase()&&(t.push("tcptype"),t.push(e.tcpType)),"candidate:"+t.join(" ")},parseRtpMap:function(e){var t=e.substr(9).split(" "),n={payloadType:parseInt(t.shift(),10)};return t=t[0].split("/"),n.name=t[0],n.clockRate=parseInt(t[1],10),n.numChannels=3===t.length?parseInt(t[2],10):1,n},writeRtpMap:function(e){var t=e.payloadType;return void 0!==e.preferredPayloadType&&(t=e.preferredPayloadType),"a=rtpmap:"+t+" "+e.name+"/"+e.clockRate+(1!==e.numChannels?"/"+e.numChannels:"")+"\r\n"},parseFmtp:function(e){for(var t,n={},r=e.substr(e.indexOf(" ")+1).split(";"),i=0;i<r.length;i++)n[(t=r[i].trim().split("="))[0].trim()]=t[1];return n},writeFtmp:function(e){var t="",n=e.payloadType;if(void 0!==e.preferredPayloadType&&(n=e.preferredPayloadType),e.parameters&&e.parameters.length){var r=[];Object.keys(e.parameters).forEach(function(t){r.push(t+"="+e.parameters[t])}),t+="a=fmtp:"+n+" "+r.join(";")+"\r\n"}return t},parseRtcpFb:function(e){var t=e.substr(e.indexOf(" ")+1).split(" ");return{type:t.shift(),parameter:t.join(" ")}},writeRtcpFb:function(e){var t="",n=e.payloadType;return void 0!==e.preferredPayloadType&&(n=e.preferredPayloadType),e.rtcpFeedback&&e.rtcpFeedback.length&&e.rtcpFeedback.forEach(function(e){t+="a=rtcp-fb:"+n+" "+e.type+" "+e.parameter+"\r\n"}),t},parseSsrcMedia:function(e){var t=e.indexOf(" "),n={ssrc:e.substr(7,t-7)},r=e.indexOf(":",t);return r>-1?(n.attribute=e.substr(t+1,r-t-1),n.value=e.substr(r+1)):n.attribute=e.substr(t+1),n},getDtlsParameters:function(e,t){var n=m.splitLines(e),r=(n=n.concat(m.splitLines(t))).filter(function(e){return 0===e.indexOf("a=fingerprint:")})[0].substr(14);return{role:"auto",fingerprints:[{algorithm:r.split(" ")[0],value:r.split(" ")[1]}]}},writeDtlsParameters:function(e,t){var n="a=setup:"+t+"\r\n";return e.fingerprints.forEach(function(e){n+="a=fingerprint:"+e.algorithm+" "+e.value+"\r\n"}),n},getIceParameters:function(e,t){var n=m.splitLines(e);return{usernameFragment:(n=n.concat(m.splitLines(t))).filter(function(e){return 0===e.indexOf("a=ice-ufrag:")})[0].substr(12),password:n.filter(function(e){return 0===e.indexOf("a=ice-pwd:")})[0].substr(10)}},writeIceParameters:function(e){return"a=ice-ufrag:"+e.usernameFragment+"\r\na=ice-pwd:"+e.password+"\r\n"},parseRtpParameters:function(e){for(var t={codecs:[],headerExtensions:[],fecMechanisms:[],rtcp:[]},n=m.splitLines(e)[0].split(" "),r=3;r<n.length;r++){var i=n[r],o=m.matchPrefix(e,"a=rtpmap:"+i+" ")[0];if(o){var a=m.parseRtpMap(o),c=m.matchPrefix(e,"a=fmtp:"+i+" ");a.parameters=c.length?m.parseFmtp(c[0]):{},a.rtcpFeedback=m.matchPrefix(e,"a=rtcp-fb:"+i+" ").map(m.parseRtcpFb),t.codecs.push(a)}}return t},writeRtpDescription:function(e,t){var n="";return n+="m="+e+" ",n+=t.codecs.length>0?"9":"0",n+=" UDP/TLS/RTP/SAVPF ",n+=t.codecs.map(function(e){return void 0!==e.preferredPayloadType?e.preferredPayloadType:e.payloadType}).join(" ")+"\r\n",n+="c=IN IP4 0.0.0.0\r\n",n+="a=rtcp:9 IN IP4 0.0.0.0\r\n",t.codecs.forEach(function(e){n+=m.writeRtpMap(e),n+=m.writeFtmp(e),n+=m.writeRtcpFb(e)}),n+="a=rtcp-mux\r\n"},writeSessionBoilerplate:function(){return"v=0\r\no=thisisadapterortc 8169639915646943137 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n"},writeMediaSection:function(e,t,n,r){var i=m.writeRtpDescription(e.kind,t);if(i+=m.writeIceParameters(e.iceGatherer.getLocalParameters()),i+=m.writeDtlsParameters(e.dtlsTransport.getLocalParameters(),"offer"===n?"actpass":"active"),i+="a=mid:"+e.mid+"\r\n",e.rtpSender&&e.rtpReceiver?i+="a=sendrecv\r\n":e.rtpSender?i+="a=sendonly\r\n":e.rtpReceiver?i+="a=recvonly\r\n":i+="a=inactive\r\n",e.rtpSender){var o="msid:"+r.id+" "+e.rtpSender.track.id+"\r\n";i+="a="+o,i+="a=ssrc:"+e.sendSsrc+" "+o}return i+"a=ssrc:"+e.sendSsrc+" cname:"+v+"\r\n"},getDirection:function(e,t){for(var n=m.splitLines(e),r=0;r<n.length;r++)switch(n[r]){case"a=sendrecv":case"a=sendonly":case"a=recvonly":case"a=inactive":return n[r].substr(2)}return t?m.getDirection(t):"sendrecv"}};window.RTCIceCandidate||(window.RTCIceCandidate=function(e){return e}),window.RTCSessionDescription||(window.RTCSessionDescription=function(e){return e}),window.RTCPeerConnection=function(e){var t=this;if(this.onicecandidate=null,this.onaddstream=null,this.onremovestream=null,this.onsignalingstatechange=null,this.oniceconnectionstatechange=null,this.onnegotiationneeded=null,this.ondatachannel=null,this.localStreams=[],this.remoteStreams=[],this.getLocalStreams=function(){return t.localStreams},this.getRemoteStreams=function(){return t.remoteStreams},this.localDescription=new b({type:"",sdp:""}),this.remoteDescription=new b({type:"",sdp:""}),this.signalingState="stable",this.iceConnectionState="new",this.iceOptions={gatherPolicy:"all",iceServers:[]},e&&e.iceTransportPolicy)switch(e.iceTransportPolicy){case"all":case"relay":this.iceOptions.gatherPolicy=e.iceTransportPolicy;break;case"none":throw new TypeError('iceTransportPolicy "none" not supported')}e&&e.iceServers&&e.iceServers.forEach(function(e){var n;e.urls&&-1!==(n="string"==typeof e.urls?e.urls:e.urls[0]).indexOf("transport=udp")&&t.iceServers.push({username:e.username,credential:e.credential,urls:n})}),this.transceivers=[],this._localIceCandidatesBuffer=[]},window.RTCPeerConnection.prototype._emitBufferedCandidates=function(){var e=this;this._localIceCandidatesBuffer.forEach(function(t){null!==e.onicecandidate&&e.onicecandidate(t)}),this._localIceCandidatesBuffer=[]},window.RTCPeerConnection.prototype.addStream=function(e){this.localStreams.push(e.clone()),this._maybeFireNegotiationNeeded()},window.RTCPeerConnection.prototype.removeStream=function(e){var t=this.localStreams.indexOf(e);t>-1&&(this.localStreams.splice(t,1),this._maybeFireNegotiationNeeded())},window.RTCPeerConnection.prototype._getCommonCapabilities=function(e,t){var n={codecs:[],headerExtensions:[],fecMechanisms:[]};return e.codecs.forEach(function(e){for(var r=0;r<t.codecs.length;r++){var i=t.codecs[r];if(e.name.toLowerCase()===i.name.toLowerCase()&&e.clockRate===i.clockRate&&e.numChannels===i.numChannels){n.codecs.push(i);break}}}),e.headerExtensions.forEach(function(e){for(var r=0;r<t.headerExtensions.length;r++){var i=t.headerExtensions[r];if(e.uri===i.uri){n.headerExtensions.push(i);break}}}),n},window.RTCPeerConnection.prototype._createIceAndDtlsTransports=function(e,t){var n=this,r=new RTCIceGatherer(n.iceOptions),i=new RTCIceTransport(r);r.onlocalcandidate=function(o){var a={};a.candidate={sdpMid:e,sdpMLineIndex:t};var c=o.candidate;c&&0!==Object.keys(c).length?(c.component="RTCP"===i.component?2:1,a.candidate.candidate=m.writeCandidate(c)):(void 0===r.state&&(r.state="completed"),a.candidate.candidate="candidate:1 1 udp 1 0.0.0.0 9 typ endOfCandidates");var s=n.transceivers.every(function(e){return e.iceGatherer&&"completed"===e.iceGatherer.state});null!==n.onicecandidate&&(n.localDescription&&""===n.localDescription.type?(n._localIceCandidatesBuffer.push(a),s&&n._localIceCandidatesBuffer.push({})):(n.onicecandidate(a),s&&n.onicecandidate({})))},i.onicestatechange=function(){n._updateConnectionState()};var o=new RTCDtlsTransport(i);return o.ondtlsstatechange=function(){n._updateConnectionState()},o.onerror=function(){o.state="failed",n._updateConnectionState()},{iceGatherer:r,iceTransport:i,dtlsTransport:o}},window.RTCPeerConnection.prototype._transceive=function(e,t,n){var r=this._getCommonCapabilities(e.localCapabilities,e.remoteCapabilities);t&&e.rtpSender&&(r.encodings=[{ssrc:e.sendSsrc}],r.rtcp={cname:v,ssrc:e.recvSsrc},e.rtpSender.send(r)),n&&e.rtpReceiver&&(r.encodings=[{ssrc:e.recvSsrc}],r.rtcp={cname:e.cname,ssrc:e.sendSsrc},e.rtpReceiver.receive(r))},window.RTCPeerConnection.prototype.setLocalDescription=function(e){var t=this;if("offer"===e.type)this._pendingOffer&&(this.transceivers=this._pendingOffer,delete this._pendingOffer);else if("answer"===e.type){var n=m.splitSections(t.remoteDescription.sdp),r=n.shift();n.forEach(function(e,n){var i=t.transceivers[n],o=i.iceGatherer,a=i.iceTransport,c=i.dtlsTransport,s=i.localCapabilities,d=i.remoteCapabilities;if("0"!==e.split("\n",1)[0].split(" ",2)[1]){var u=m.getIceParameters(e,r);a.start(o,u,"controlled");var l=m.getDtlsParameters(e,r);c.start(l);var p=t._getCommonCapabilities(s,d);t._transceive(i,p.codecs.length>0,!1)}})}switch(this.localDescription=e,e.type){case"offer":this._updateSignalingState("have-local-offer");break;case"answer":this._updateSignalingState("stable");break;default:throw new TypeError('unsupported type "'+e.type+'"')}var i=arguments.length>1&&"function"==typeof arguments[1];if(i){var o=arguments[1];window.setTimeout(function(){o(),t._emitBufferedCandidates()},0)}var a=Promise.resolve();return a.then(function(){i||window.setTimeout(t._emitBufferedCandidates.bind(t),0)}),a},window.RTCPeerConnection.prototype.setRemoteDescription=function(e){var t=this,n=new MediaStream,r=m.splitSections(e.sdp),i=r.shift();switch(r.forEach(function(r,o){var a,c,s,d,u,l,p,f,h,v,g,y=m.splitLines(r)[0].substr(2).split(" "),w=y[0],b="0"===y[1],C=m.getDirection(r,i),T=m.parseRtpParameters(r);b||(v=m.getIceParameters(r,i),g=m.getDtlsParameters(r,i));var R,S=m.matchPrefix(r,"a=mid:")[0].substr(6),P=m.matchPrefix(r,"a=ssrc:").map(function(e){return m.parseSsrcMedia(e)}).filter(function(e){return"cname"===e.attribute})[0];if(P&&(f=parseInt(P.ssrc,10),R=P.value),"offer"===e.type){var k=t._createIceAndDtlsTransports(S,o);if(h=RTCRtpReceiver.getCapabilities(w),p=1001*(2*o+2),l=new RTCRtpReceiver(k.dtlsTransport,w),n.addTrack(l.track),t.localStreams.length>0&&t.localStreams[0].getTracks().length>=o){var D=t.localStreams[0].getTracks()[o];u=new RTCRtpSender(D,k.dtlsTransport)}t.transceivers[o]={iceGatherer:k.iceGatherer,iceTransport:k.iceTransport,dtlsTransport:k.dtlsTransport,localCapabilities:h,remoteCapabilities:T,rtpSender:u,rtpReceiver:l,kind:w,mid:S,cname:R,sendSsrc:p,recvSsrc:f},t._transceive(t.transceivers[o],!1,"sendrecv"===C||"sendonly"===C)}else"answer"!==e.type||b||(c=(a=t.transceivers[o]).iceGatherer,s=a.iceTransport,d=a.dtlsTransport,u=a.rtpSender,l=a.rtpReceiver,p=a.sendSsrc,h=a.localCapabilities,t.transceivers[o].recvSsrc=f,t.transceivers[o].remoteCapabilities=T,t.transceivers[o].cname=R,s.start(c,v,"controlling"),d.start(g),t._transceive(a,"sendrecv"===C||"recvonly"===C,"sendrecv"===C||"sendonly"===C),!l||"sendrecv"!==C&&"sendonly"!==C?delete a.rtpReceiver:n.addTrack(l.track))}),this.remoteDescription=e,e.type){case"offer":this._updateSignalingState("have-remote-offer");break;case"answer":this._updateSignalingState("stable");break;default:throw new TypeError('unsupported type "'+e.type+'"')}return window.setTimeout(function(){null!==t.onaddstream&&n.getTracks().length&&(t.remoteStreams.push(n),window.setTimeout(function(){t.onaddstream({stream:n})},0))},0),arguments.length>1&&"function"==typeof arguments[1]&&window.setTimeout(arguments[1],0),Promise.resolve()},window.RTCPeerConnection.prototype.close=function(){this.transceivers.forEach(function(e){e.iceTransport&&e.iceTransport.stop(),e.dtlsTransport&&e.dtlsTransport.stop(),e.rtpSender&&e.rtpSender.stop(),e.rtpReceiver&&e.rtpReceiver.stop()}),this._updateSignalingState("closed")},window.RTCPeerConnection.prototype._updateSignalingState=function(e){this.signalingState=e,null!==this.onsignalingstatechange&&this.onsignalingstatechange()},window.RTCPeerConnection.prototype._maybeFireNegotiationNeeded=function(){null!==this.onnegotiationneeded&&this.onnegotiationneeded()},window.RTCPeerConnection.prototype._updateConnectionState=function(){var e,t={new:0,closed:0,connecting:0,checking:0,connected:0,completed:0,failed:0};this.transceivers.forEach(function(e){t[e.iceTransport.state]++,t[e.dtlsTransport.state]++}),t.connected+=t.completed,e="new",t.failed>0?e="failed":t.connecting>0||t.checking>0?e="connecting":t.disconnected>0?e="disconnected":t.new>0?e="new":(t.connecting>0||t.completed>0)&&(e="connected"),e!==this.iceConnectionState&&(this.iceConnectionState=e,null!==this.oniceconnectionstatechange&&this.oniceconnectionstatechange())},window.RTCPeerConnection.prototype.createOffer=function(){var e,t=this;if(this._pendingOffer)throw new Error("createOffer called while there is a pending offer.");1===arguments.length&&"function"!=typeof arguments[0]?e=arguments[0]:3===arguments.length&&(e=arguments[2]);var n=[],r=0,i=0;if(this.localStreams.length&&(r=this.localStreams[0].getAudioTracks().length,i=this.localStreams[0].getVideoTracks().length),e){if(e.mandatory||e.optional)throw new TypeError("Legacy mandatory/optional constraints not supported.");void 0!==e.offerToReceiveAudio&&(r=e.offerToReceiveAudio),void 0!==e.offerToReceiveVideo&&(i=e.offerToReceiveVideo)}for(this.localStreams.length&&this.localStreams[0].getTracks().forEach(function(e){n.push({kind:e.kind,track:e,wantReceive:"audio"===e.kind?r>0:i>0}),"audio"===e.kind?r--:"video"===e.kind&&i--});r>0||i>0;)r>0&&(n.push({kind:"audio",wantReceive:!0}),r--),i>0&&(n.push({kind:"video",wantReceive:!0}),i--);var o=m.writeSessionBoilerplate(),a=[];n.forEach(function(e,n){var r,i,c=e.track,s=e.kind,d=h(),u=t._createIceAndDtlsTransports(d,n),l=RTCRtpSender.getCapabilities(s),p=1001*(2*n+1);c&&(r=new RTCRtpSender(c,u.dtlsTransport)),e.wantReceive&&(i=new RTCRtpReceiver(u.dtlsTransport,s)),a[n]={iceGatherer:u.iceGatherer,iceTransport:u.iceTransport,dtlsTransport:u.dtlsTransport,localCapabilities:l,remoteCapabilities:null,rtpSender:r,rtpReceiver:i,kind:s,mid:d,sendSsrc:p,recvSsrc:null};var f=a[n];o+=m.writeMediaSection(f,f.localCapabilities,"offer",t.localStreams[0])}),this._pendingOffer=a;var c=new b({type:"offer",sdp:o});return arguments.length&&"function"==typeof arguments[0]&&window.setTimeout(arguments[0],0,c),Promise.resolve(c)},window.RTCPeerConnection.prototype.createAnswer=function(){var e=this;1===arguments.length&&"function"!=typeof arguments[0]?arguments[0]:3===arguments.length&&arguments[2];var t=m.writeSessionBoilerplate();this.transceivers.forEach(function(n){var r=e._getCommonCapabilities(n.localCapabilities,n.remoteCapabilities);t+=m.writeMediaSection(n,r,"answer",e.localStreams[0])});var n=new b({type:"answer",sdp:t});return arguments.length&&"function"==typeof arguments[0]&&window.setTimeout(arguments[0],0,n),Promise.resolve(n)},window.RTCPeerConnection.prototype.addIceCandidate=function(e){var t=e.sdpMLineIndex;if(e.sdpMid)for(var n=0;n<this.transceivers.length;n++)if(this.transceivers[n].mid===e.sdpMid){t=n;break}var r=this.transceivers[t];if(r){var i=Object.keys(e.candidate).length>0?m.parseCandidate(e.candidate):{};if("tcp"===i.protocol&&0===i.port)return;if("1"!==i.component)return;"endOfCandidates"===i.type&&(i={}),r.iceTransport.addRemoteCandidate(i)}return arguments.length>1&&"function"==typeof arguments[1]&&window.setTimeout(arguments[1],0),Promise.resolve()},window.RTCPeerConnection.prototype.getStats=function(){var e=[];this.transceivers.forEach(function(t){["rtpSender","rtpReceiver","iceGatherer","iceTransport","dtlsTransport"].forEach(function(n){t[n]&&e.push(t[n].getStats())})});var t=arguments.length>1&&"function"==typeof arguments[1]&&arguments[1];return new Promise(function(n){var r={};Promise.all(e).then(function(e){e.forEach(function(e){Object.keys(e).forEach(function(t){r[t]=e[t]})}),t&&window.setTimeout(t,0,r),n(r)})})}}}else u.log("Browser does not appear to be WebRTC-capable");else u.log("This does not appear to be a browser"),c="not a browser";function g(e){return new Promise(function(t,n){r(e,t,n)})}"object"!=("undefined"==typeof window?"undefined":o(window))||!window.RTCPeerConnection||"ontrack"in window.RTCPeerConnection.prototype||Object.defineProperty(window.RTCPeerConnection.prototype,"ontrack",{get:function(){return this._ontrack},set:function(e){var t=this;this._ontrack&&(this.removeEventListener("track",this._ontrack),this.removeEventListener("addstream",this._ontrackpoly)),this.addEventListener("track",this._ontrack=e),this.addEventListener("addstream",this._ontrackpoly=function(e){"chrome"===c&&e.stream.addEventListener("addtrack",function(n){var r=new Event("track");r.track=n.track,r.receiver={track:n.track},r.streams=[e.stream],t.dispatchEvent(r)}),e.stream.getTracks().forEach(function(t){var n=new Event("track");n.track=t,n.receiver={track:t},n.streams=[e.stream],this.dispatchEvent(n)}.bind(this))}.bind(this))}});var y,w,b,C={};try{Object.defineProperty(C,"version",{set:function(e){s=e}})}catch(e){}"undefined"!=typeof window&&(y=window.RTCPeerConnection,w=window.RTCIceCandidate,b=window.RTCSessionDescription),e.exports={RTCPeerConnection:y,RTCIceCandidate:w,RTCSessionDescription:b,getUserMedia:r,attachMediaStream:i,reattachMediaStream:a,webrtcDetectedBrowser:c,webrtcDetectedVersion:s,webrtcMinimumVersion:d,webrtcTesting:C,webrtcUtils:u}}]).default})}).call(t,n(1)(e))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children||(e.children=[]),Object.defineProperty(e,"loaded",{enumerable:!0,get:function(){return e.l}}),Object.defineProperty(e,"id",{enumerable:!0,get:function(){return e.i}}),e.webpackPolyfill=1),e}}]).default});