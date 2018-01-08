/**
* Copyright 2016 PT Inovação e Sistemas SA
* Copyright 2016 INESC-ID
* Copyright 2016 QUOBIS NETWORKS SL
* Copyright 2016 FRAUNHOFER-GESELLSCHAFT ZUR FOERDERUNG DER ANGEWANDTEN FORSCHUNG E.V
* Copyright 2016 ORANGE SA
* Copyright 2016 Deutsche Telekom AG
* Copyright 2016 Apizee
* Copyright 2016 TECHNISCHE UNIVERSITAT BERLIN
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/

/* jshint undef: true */
/* globals RTCPeerConnection */
/* globals RTCSessionDescription */
/* globals RTCIceCandidate */

import 'webrtc-adapter';

import peer from './peer';

let newSdp;
let newPeerConnection = {};

class ConferenceController {

  constructor(syncher, domain, configuration, username) {

    if (!syncher) throw new Error('The syncher is a needed parameter');
    if (!domain) throw new Error('The domain is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;

    _this.mode = 'offer';
    _this.peer = peer;
    _this.user = username;

    _this.autoSubscribeActivated = false;
   //  TODO get myURL

    // Private
    _this._syncher = syncher;
    _this._configuration = configuration;
    _this._domain = domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschema/Connection';

    // Prepare the PeerConnection
    newPeerConnection[_this.user] = new RTCPeerConnection(_this._configuration.webrtc);
    console.debug('_this._username is :', _this.user);

    newPeerConnection[_this.user].addEventListener('signalingstatechange', function(event) {

      console.info('signalingstatechange', event.currentTarget.signalingState);

      if (event.currentTarget.signalingState === 'have-local-offer') {
        console.info('signalingstatechange - have-local-offer: ', event.currentTarget.signalingState);
      }

      if (event.currentTarget.signalingState === 'have-remote-offer') {
        console.info('signalingstatechange - have-remote-offer: ', event.currentTarget.signalingState);
        _this.mode = 'answer';
      }
    });

    newPeerConnection[_this.user].addEventListener('iceconnectionstatechange', function(event) {
      console.info('iceconnectionstatechange', event.currentTarget.iceConnectionState, _this.dataObjectReporter);
      let data = _this.dataObjectReporter.data;
      if (data.hasOwnProperty('status')) {
        data.status = event.currentTarget.iceConnectionState;
      }
    });

    newPeerConnection[_this.user].addEventListener('icecandidate', function(event) {

      if (!event.candidate) return;

//workaround test
      let n = JSON.stringify(event.candidate.candidate).indexOf("typ host");
      if(n !== -1) {
        console.error('Candidate is host - Filtering');
        return;
      } else {
        console.error('Candidate is not host - not Filtering');
      }
//workaround test

      let icecandidate = {
        type: 'candidate',
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex
      };

      let message = {
        id: 'onIceCandidate',
        userName: _this.user,
        senderName: _this.user,
        icecandidate : icecandidate
      }

      let data = _this.dataObjectReporter.data;

  /**
   * @param  {nodejsRuntime}
   **/
  // new model
      data.iceCandidates.push(message);
      // if (_this.mode === 'offer') {
      //   data.ownerPeer.iceCandidates.push(message);
      // } else {
      //   data.Peer.iceCandidates.push(message);
      // }

    });

    // Add stream to PeerConnection
    newPeerConnection[_this.user].addEventListener('addstream', function(event) {
      console.info('Remote stream added to PeerConnection: ', event);

      if (_this._onAddStream) _this._onAddStream(event, _this.user);
    });

    newPeerConnection[_this.user].onremovestream = function(event) {
      console.info('Stream removed: ', event);
    };

    newPeerConnection[_this.user].onsignalingstatechange = function(event) {
      console.info('onsignalingstatechange: ', event);
    };

    newPeerConnection[_this.user].oniceconnectionstatechange = function(event) {
      console.info('oniceconnectionstatechange: ', event);
    };
  }

  set mediaStream(mediaStream) {
    if (!mediaStream) throw new Error('The mediaStream is a needed parameter');

    let _this = this;
    console.info('set stream: ', mediaStream);
    _this._mediaStream = mediaStream;
    newPeerConnection[_this.user].addStream(mediaStream);
  }

  set username(name) {
    if (!name) throw new Error('The name is a needed parameter');

    let _this = this;
    console.info('set username: ', name);
    return _this._username = name;
  }

  get mediaStream() {
    let _this = this;
    return _this._mediaStream;
  }

  /**
  * Set the dataObject in the controller
  * @param {ConnectionDataObject} dataObject - have all information about the syncher object;
  */
  set dataObjectReporter(dataObjectReporter) {
    if (!dataObjectReporter) throw new Error('The Data Object Reporter is a needed parameter');

    let _this = this;
    console.debug('set data object reporter: ', dataObjectReporter);
    _this._dataObjectReporter = dataObjectReporter;

    dataObjectReporter.onSubscription(function(event) {
      event.accept();
    });

  /**
   * @param  {nodejsRuntime}
   **/

    if (_this.mode === 'offer') {
      _this._createOffer(_this.user, _this.mode);
    } else {
      _this._createAnswer(_this.user);
    }
  }

  /**
  * return the dataObject in the controller
  * @return {ConnectionDataObject} dataObject
  */
  get dataObjectReporter() {
    let _this = this;
    return _this._dataObjectReporter;
  }

  /**
  * Set the dataObject in the controller
  * @param {ConnectionDataObject} dataObject - have all information about the syncher object;
  */
  set dataObjectObserver(dataObjectObserver) {
    if (!dataObjectObserver) throw new Error('The Data Object Observer is a needed parameter');

    let _this = this;
    // object observer from the peer joining the room including sdp of the peer

    console.debug('ConferenceController :: set data object observer: ', dataObjectObserver);
    _this._dataObjectObserver = dataObjectObserver;
    console.debug('set data object observer: ', _this._dataObjectObserver );

    _this._changePeerInformation(dataObjectObserver);
  }

  /**
  * return the dataObject in the controller
  * @return {ConnectionDataObject} dataObject
  */

  get dataObjectObserver() {
    let _this = this;
    return _this._dataObjectObserver;
  }

  /**
   * Set the connection event to accept or reject
   * @param  {CreateEvent} event Event with actions to accept or reject the connection
   */
  set connectionEvent(event) {
    let _this = this;
    _this._connectionEvent = event;
  }

  /**
   * Get the connection event to accept or reject
   * @return {CreateEvent}
   */
  get connectionEvent() {
    let _this = this;
    return _this._connectionEvent;
  }

  set deleteEvent(event) {
    let _this = this;
    _this._deleteEvent = event;

    _this._removeMediaStream();
    if (_this._onDisconnect) _this._onDisconnect(event.identity);
  }

  get deleteEvent() {
    let _this = this;
    return _this._deleteEvent;
  }

  _removeMediaStream() {
    let _this = this;
    console.log(_this.mediaStream, newPeerConnection[_this.user]);

    if (_this.mediaStream) {

      let tracks = _this.mediaStream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });
    }

    newPeerConnection[_this.user].removeStream(_this.mediaStream);
    newPeerConnection[_this.user].close();
  }

  _changePeerInformation(dataObjectObserver) {
    let _this = this;
    let data = dataObjectObserver.data;
    // let isOwner = data.hasOwnProperty('ownerPeer');
    // console.debug('isOwner:',isOwner);

  // New model
    let peerData = dataObjectObserver.data;

    // let peerData = isOwner ? data.ownerPeer : data.Peer;
    console.info('[Conference ConnectionController ] Peer Data:', JSON.stringify(peerData));

    if(peerData !== 'undefined') {
      if (peerData.hasOwnProperty('connectionDescription')) {
         console.debug('Process Peer data connectionDescription: ', peerData);
        _this._processPeerInformation(peerData);
      }

      if (peerData.hasOwnProperty('iceCandidates')) {
        console.debug('Process Peer data iceCandidates: ', peerData);
        peerData.iceCandidates.forEach(function(ice) {
          _this._processPeerInformation(ice);
        });
      }

      if (peerData.hasOwnProperty('message')) {
        console.debug('Process Peer message : ', peerData)
        console.debug('data.message : ', data.message)

        if(data.message.id === 'existingParticipants') {
          console.debug('existingParticipants are :', data.message.data);

          if (_this._onParticipant) _this._onParticipant(data.message);

          if (data.message.data.length !== 0) {
            if (_this.autoSubscribeActivated === true) {
              _this.onExistingParticipants(data.message);
            }
          }
        }
        if(data.message.id === 'receiveVideoAnswer') {
          console.debug('receiveVideoAnswer :', data.message)
          _this._processPeerInformation(data.message);
        }
        if(data.message.id === 'IceCandidate') {
          console.debug('iceCandidate received :', data.message.candidate)
          _this._processPeerInformation(data.message);
        }
        if(data.message.id  === 'newParticipantArrived') {
          console.debug('newParticipantArrived is :', data.message)

          if (_this.autoSubscribeActivated === true) {
            _this.onNewParticipant(data.message);
          }

          if (_this._onParticipant) _this._onParticipant(data.message);
          //_this.onExistingParticipants(data.message);
        }
      }

      dataObjectObserver.onChange('*', function(event) {
        _this._processPeerInformation(event.data);
      });
    }
  }

  /**
   * @param  {nodejsRuntime}
   **/
  _processPeerInformation(data) {
    let _this = this;
    console.debug('_processPeerInformation : ', data)
    console.debug(JSON.stringify(data));

    if (data.type === 'offer' || data.type === 'answer') {
      console.debug('Process Connection Description: ', data.sdp);
      newPeerConnection[_this.user].setRemoteDescription(new RTCSessionDescription(data), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);
    }

    else if (data.id === 'receiveVideoAnswer') {
      // console.debug('Process Connection Descriptionn , receiveAnswer: ', data.sdpAnswer, _this._username, data.name, newPeerConnection);
       newPeerConnection[data.name].setRemoteDescription(new RTCSessionDescription({type: 'answer', sdp: data.sdpAnswer}), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);
    }

    if (data.id === 'IceCandidate') {
      console.error('[Conference ConnectionController ] Process Ice Candidate: data :', data);
      console.error('data.candidate', data.candidate);

      let parsedCandidate = {
        //type: 'candidate',
        candidate:data.candidate.candidate,
        //sdpMid:data.candidate.sdpMid,
        sdpMLineIndex:data.candidate.sdpMLineIndex
      }
      console.error('parsedCandidate : ', parsedCandidate);
      newPeerConnection[data.name].addIceCandidate(new RTCIceCandidate(parsedCandidate), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);
    }

    if(data.id  === 'newParticipantArrived') {
      console.debug('newParticipantArrived is :', data);

      if (_this.autoSubscribeActivated === true) {
        _this.onNewParticipant(data);
      }

//if (_this._onParticipant) _this._onParticipant(data.message);
    }
    // if(data.message.id === 'existingParticipants') {
    //   console.debug('existingParticipants are :', data.message.data)
    //   if(data.message.data.length !== 0) {
    //     _this.onExistingParticipants(data.message);
    //   }
    // }
  }
  onExistingParticipants(msg) {
    let _this = this;
     console.debug("onExistingParticipants message", msg);
     msg.data.forEach(function(senderName) {
       console.debug('------------------- is : ', senderName);
      _this.receiveVideo(senderName).then((result) => {
        console.debug('##### On receiveVideo from ########', result)
        _this.mode = 'RecvOnly';
        _this._createOfferToReceive(senderName, _this.mode, false);
      });
    });
  }

  receiveVideo(senderName, forceStreamRestart) {
    let _this = this;
    let username = _this.user;
    let data = _this.dataObjectReporter.data;

    console.error('conferenceroom::receiveVideo', senderName);

    if (senderName === undefined) {
      console.error('sendername undefined, leaving receiveVideo', senderName);
      return;
    }

    if (forceStreamRestart === true) {

      if(newPeerConnection[senderName] !== undefined) {

        console.error('Forcing cleaning stream :', senderName);

        if (_this._onCleanStream) _this._onCleanStream(senderName);

        newPeerConnection[senderName].close();
        delete newPeerConnection[senderName];
      }
    }

    return new Promise((resolve, reject) => {
      try {

        if( newPeerConnection[senderName] !== undefined) {
          console.error('conferenceroom::receiveVideo, subscribe already exist, not subscribing a second time');
          reject();

        } else {

          newPeerConnection[senderName] = new RTCPeerConnection(_this._configuration.webrtc);
          // console.debug('_this._username is :', _this.user, username);

          newPeerConnection[senderName].addEventListener('signalingstatechange', (event) => {

            console.info('signalingstatechange', event.currentTarget.signalingState);

            if (event.currentTarget.signalingState === 'have-local-offer') {
              console.info('signalingstatechange - have-local-offer: ', event.currentTarget.signalingState);
            }

            if (event.currentTarget.signalingState === 'have-remote-offer') {
              console.info('signalingstatechange - have-remote-offer: ', event.currentTarget.signalingState);
              // _this.mode = 'answer';
            }
          });

          newPeerConnection[senderName].addEventListener('iceconnectionstatechange', (event) => {
            console.info('iceconnectionstatechange', event.currentTarget.iceConnectionState, _this.dataObjectReporter);

            if (data.hasOwnProperty('status')) {
              data.status = event.currentTarget.iceConnectionState;
            }
          });

          newPeerConnection[senderName].addEventListener('icecandidate', (event) => {

            // console.info('icecandidate changes', event.candidate, _this.dataObjectReporter);

            if (!event.candidate) return;
            let icecandidate = {
              type: 'candidate',
              candidate: event.candidate.candidate,
              sdpMid: event.candidate.sdpMid,
              sdpMLineIndex: event.candidate.sdpMLineIndex
            };

            let message = {
              id: 'onIceCandidate',
              userName: username,
              senderName: senderName,
              icecandidate : icecandidate
            }

            data.iceCandidates.push(message);
          });

          console.debug('this._mediaStream is : ', _this._mediaStream)
          newPeerConnection[senderName].addStream(_this._mediaStream);

          // Add stream to PeerConnection
          newPeerConnection[senderName].addEventListener('addstream', (event) => {
            console.debug('Add Stream: ', event);

            // newPeerConnection[senderName].addStream(_this._mediaStream);
            console.log('/************************* _this._onAddStream :', _this._onAddStream)

            if (_this._onAddStream)  _this._onAddStream(event, senderName);
          });

          newPeerConnection[senderName].onremovestream = (event) => {
            console.info('Stream removed: ', event);
          };

          newPeerConnection[senderName].onsignalingstatechange = function(event) {
            console.info('onsignalingstatechange: ', event);
          };

          newPeerConnection[senderName].oniceconnectionstatechange = function(event) {
            console.info('oniceconnectionstatechange: ', event);
          };
        }
      } catch (e) {
        reject('error accepting connection');
      }
      resolve(newPeerConnection[senderName]);
    });
  }

  setSendOnly(sdp) {
    sdp = sdp.replace(/a=sendrecv\r\n/g, 'a=sendonly\r\n');
    sdp = sdp.replace(/a=recvonly\r\n/g, 'a=sendonly\r\n');
    return sdp;
  }

  setRecvOnly(sdp) {
    sdp = sdp.replace(/a=sendrecv\r\n/g, 'a=recvonly\r\n');
    sdp = sdp.replace(/a=sendonly\r\n/g, 'a=recvonly\r\n');
    return sdp;
  }

  onNewParticipant(request) {
    let _this = this;
    let userName = _this.user;

    console.debug('onNewParticipant :', request.name);
    _this.receiveVideo(request.name).then((result) => {
      console.debug('##### On receiveVideo from ########', result)
      //_this.mode = 'RecvOnly';
      //_this._createOffer(request.name, _this.mode);
      _this.mode = 'RecvOnly';
      _this._createOfferToReceive(request.name, _this.mode, false);
    }).catch((reason) => {
      console.error('[Error], has occured, reason :', reason);
    });
  }

  _remoteDescriptionSuccess() {
    console.info('remote success');
  }

  _remoteDescriptionError(error) {
    console.error('error: ', error);
  }

  _createOffer(senderName, mode) {
    let _this = this;
    //let sdescription;

    console.info('################ createOffer sender #############################"', senderName);

    return new Promise((resolve, reject) => {

      //Setting this offer as sendOnly
      let offerOptions = {'offerToReceiveAudio':false,'offerToReceiveVideo':false};

      newPeerConnection[senderName].createOffer(offerOptions).then((description) => {
        console.debug('created offer is : ', description);

        //sdescription = description;
        return _this._onLocalSessionCreated(description, senderName, mode);
      //}).then(() => {
        // _this.sendToServer(sdescription, mode, senderName);
      }).catch((reason) => {
        // An error occurred, so handle the failure to connect
        console.error('[Error] has occured, reason :', reason);
      });
    })
  }

  stripVideoMediaDescriptionFromSDP(sdp) {

      console.info("stripVideoMediaDescriptionFromSDP");
      sdp = sdp.replace('a=group:BUNDLE audio video', 'a=group:BUNDLE audio');
      var sdpMediaPart = sdp.split('m=video'),
          i = 0;
      //for (i = 0; i < sdpMediaPart.length; i += 1) {
      //    console.log("sdpMediaPart[i] : " + sdpMediaPart[i]);
      //}
      return sdpMediaPart[0];
  };

  _createOfferToReceive(senderName, mode, audioOnly) {
    let _this = this;

    console.info('################ createOffer receiver #############################"', senderName, mode);

    let offerOptions = {};

    if (audioOnly === true) {
      offerOptions = {'offerToReceiveAudio':true,'offerToReceiveVideo':false};
    } else {
      offerOptions = {'offerToReceiveAudio':true,'offerToReceiveVideo':true};
    }

    newPeerConnection[senderName].createOffer(offerOptions).then((description) => {
      console.debug('created subscribe offer is : ', description);

      if (audioOnly === true) {
        description.sdp = _this.stripVideoMediaDescriptionFromSDP(description.sdp);
        console.debug('modified offer is : ', description);
      }

      return _this._onLocalSessionCreated(description, senderName, mode);
    }).catch((reason) => {
      // An error occurred, so handle the failure to connect
      console.error('[Error] has occured, reason :', reason);
    });
  };

  _onLocalSessionCreated(description, senderName, mode) {

    let _this = this;
    let data = _this.dataObjectReporter.data;

    console.debug('-------------------------- setLocalDescription -------------------------:',mode ,  senderName, _this.mode, description)
    if (mode === 'offer') {
      console.debug('mode is offer - publish');
      description.sdp = _this.setSendOnly(description.sdp);
      newPeerConnection[senderName].setLocalDescription(description, () => {

        let sdpConnection = {
          senderName: senderName,
          userName: _this.user,
          sdp: description.sdp,
          type: description.type
        };
        // new model
        data.connectionDescription = sdpConnection;

      //  data.ownerPeer.connectionDescription = sdpConnection;

      }, _this._infoError);
    } else {
      console.debug('mode is not offer - subscribe');
      description.sdp = _this.setRecvOnly(description.sdp);
      newPeerConnection[senderName].setLocalDescription(description, () => {

        console.debug('subscribe setLocalDescription cb');

        let sdpConnection = {
          sdp: description.sdp,
          type: description.type
        };

        let msg =  {
          id : "subscribeVideoFrom",
          senderName : senderName,
          userName: _this.user,
          sdpOffer : sdpConnection.sdp
        }

        console.debug('message is : ', msg)
         // send message to conference client Hyperty

         data.id = msg;

        }, _this._infoError);
    }
  }

  _infoError(err) {
    console.error(err.toString(), err);
  }

  /**
   * This function is used to handle the peer stream
   * @return {MediaStream}           WebRTC remote MediaStream retrieved by the Application
   */
  onAddStream(callback, username) {
    let _this = this;
    console.debug(' name is :', username );
    _this._onAddStream = callback;
  }

  onParticipant(callback) {
    let _this = this;
    console.debug(' onParticipant ' );
    _this._onParticipant = callback;
  }

  onCleanStream(callback) {
    let _this = this;
    console.debug('onCleanStream');
    _this._onCleanStream = callback;
  }

  subscribeToVideo(senderName) {
    let _this = this;
    console.debug("subscribeToVideo : ", senderName);
    var forceStreamRestart = true;

    _this.receiveVideo(senderName, forceStreamRestart).then((result) => {
      console.debug('##### On receiveVideo from ########', result)
      _this.mode = 'RecvOnly';
      _this._createOfferToReceive(senderName, _this.mode, false);
    });
  }

  subscribeToAudio(senderName) {
    let _this = this;
    console.debug("subscribeToAudio : ", senderName);
    var forceStreamRestart = true;

    _this.receiveVideo(senderName, forceStreamRestart).then((result) => {
      console.debug('##### On receiveVideo from ########', result)
      _this.mode = 'RecvOnly';
      _this._createOfferToReceive(senderName, _this.mode, true);
    });
  }

  /**
   * This function is used to receive requests to close an existing connection instance.
   * @param  {Function} callback callback function to handle with the disconnect
   * @return {DeleteEvent}       the DeleteEvent fired by the Syncher when the Connection is closed.
   */
  onDisconnect(callback) {
    let _this = this;
    _this._onDisconnect = callback;
  }

  /**
   * This function is used to accept an incoming connection request received by connection.onInvitation().
   * @param  {MediaStream}         stream     WebRTC local MediaStream retrieved by the Application
   * @return {<Promise> boolean}              It returns, as a Promise, true in case the connection is successfully accepted, false otherwise.
   */
  accept(stream) {

    let _this = this;
    let syncher = _this._syncher;

    console.debug('Remote Peer Information: ', _this.dataObjectObserver.data);
    let remotePeer = _this.dataObjectObserver.data.reporter;

    return new Promise((resolve, reject) => {
      try {
        console.info('------------------------ Syncher Create ---------------------- \n');
        syncher.create(_this._objectDescURL, [remotePeer], _this.peer)
        .then((dataObjectReporter) => {
          console.info('2. Return the Data Object Reporter ', dataObjectReporter);

          _this.mediaStream = stream;
          _this.dataObjectReporter = dataObjectReporter;
          resolve(true);
        })
        .catch((reason) => {
          console.error(reason);
          reject(false);
        });

      } catch (e) {
        reject('error accepting connection');
      }
    });
  }

  /**
   * This function is used to decline an incoming connection request received by connection.onInvitation().
   * @param  {int} reason               Integer decline reason that is compliant with RFC7231. If not present 400 is used. (optional)
   * @return {<Promise> boolean}        It returns, as a Promise, true in case the connection is successfully declined, false otherwise.
   */
  decline(reason) {

    // TODO: Optimize this process

    let _this = this;
    let declineReason = 400;
    if (reason) declineReason = reason;

    return new Promise(function(resolve, reject) {

      try {
        _this.connectionEvent.ack(declineReason);
        _this.disconnect();
        resolve(true);
      } catch (e) {
        console.error(e);
        reject(false);
      }
    });
  }

  /**
   * This function is used to close an existing connection instance.
   * @return {<Promise> boolean} It returns as a Promise true if successfully disconnected or false otherwise.
   */
  disconnect() {

    console.log("disconnect");

    // TODO: Optimize this process

    let _this = this;

    return new Promise((resolve, reject) => {

      try {

        let data;
        if (_this.dataObjectReporter) {
          data = _this.dataObjectReporter;
          data.delete();
        }

        if (_this.dataObjectObserver) {
          data = _this.dataObjectObserver;
          data.delete();
        }

        _this._removeMediaStream();

        resolve(true);
      } catch (e) {
        reject(e);
      }

    });
  }

  /**
   * Disable Microphone
   * @param  {boolean} value status of microphone
   * @return {boolean}
   */
  disableAudio(value) {
    let _this = this;

    return new Promise((resolve, reject) => {

      try {
        let localStream = newPeerConnection[_this.user].getLocalStreams()[0];
        let audioTrack = localStream.getAudioTracks()[0];

        if (!value) {
          audioTrack.enabled = audioTrack.enabled ? false : true;
        } else {
          audioTrack.enabled = value;
        }

        resolve(audioTrack.enabled);
      } catch (e) {
        reject(e);
      }

    });

  }

  /**
   * Disable video
   * @param  {boolean} value status of video
   * @return {boolean}
   */
  disableVideo(value) {
    let _this = this;

    return new Promise((resolve, reject) => {

      try {
        let localStream = newPeerConnection[_this.user].getLocalStreams()[0];
        let videoTrack = localStream.getVideoTracks()[0];

        if (!value) {
          videoTrack.enabled = videoTrack.enabled ? false : true;
        } else {
          videoTrack.enabled = value;
        }

        resolve(videoTrack.enabled);
      } catch (e) {
        reject(e);
      }
    });

  }

  mute(value) {

    let _this = this;

    return new Promise((resolve, reject) => {

      try {
        let remoteStream = newPeerConnection[_this.user].getLocalStreams()[0];
        let audioTrack = remoteStream.getAudioTracks()[0];

        if (!value) {
          audioTrack.enabled = audioTrack.enabled ? false : true;
        } else {
          audioTrack.enabled = value;
        }

        resolve(audioTrack.enabled);
      } catch (e) {
        reject(e);
      }
    });

  }

}

export default ConferenceController;
