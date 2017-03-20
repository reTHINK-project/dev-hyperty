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
let newPeerConncection = {};


class ConnectionController {

  constructor(syncher, domain, configuration, username) {

    if (!syncher) throw new Error('The syncher is a needed parameter');
    if (!domain) throw new Error('The domain is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;

    _this.mode = 'offer';
    _this.peer = peer;
    _this.user = username;
   //  TODO get myURL

    // Private
    _this._syncher = syncher;
    _this._configuration = configuration.webrtc;
    _this._domain = domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschema/Connection';

    // Prepare the PeerConnection
    newPeerConncection[username] = new RTCPeerConnection(_this._configuration);
    console.debug('_this._username is :', _this.user, username);

    newPeerConncection[username].addEventListener('signalingstatechange', function(event) {

      console.info('signalingstatechange', event.currentTarget.signalingState);

      if (event.currentTarget.signalingState === 'have-local-offer') {
        console.info('signalingstatechange - have-local-offer: ', event.currentTarget.signalingState);
      }

      if (event.currentTarget.signalingState === 'have-remote-offer') {
        console.info('signalingstatechange - have-remote-offer: ', event.currentTarget.signalingState);
        _this.mode = 'answer';
      }

    });

    newPeerConncection[username].addEventListener('iceconnectionstatechange', function(event) {
      console.info('iceconnectionstatechange', event.currentTarget.iceConnectionState, _this.dataObjectReporter);
      let data = _this.dataObjectReporter.data;
      if (data.hasOwnProperty('status')) {
        data.status = event.currentTarget.iceConnectionState;
      }
    });

    newPeerConncection[username].addEventListener('icecandidate', function(event) {

      // console.info('icecandidate changes', event.candidate, _this.dataObjectReporter);

      if (!event.candidate) return;

      let icecandidate = {
        type: 'candidate',
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex
      };

      let data = _this.dataObjectReporter.data;

      if (_this.mode === 'offer') {
        data.ownerPeer.iceCandidates.push(icecandidate);
      } else {
        data.Peer.iceCandidates.push(icecandidate);
      }

    });

    // Add stream to PeerConnection
    newPeerConncection[username].addEventListener('addstream', function(event) {
      console.info('Add Stream: ', event);

      if (_this._onAddStream) _this._onAddStream(event);
    });

    newPeerConncection[username].onremovestream = function(event) {
      console.info('Stream removed: ', event);
    };

    _this.peerConnection = newPeerConncection[username];

  }

  set mediaStream(mediaStream) {
    if (!mediaStream) throw new Error('The mediaStream is a needed parameter');

    let _this = this;
    console.info('set stream: ', mediaStream);
    _this._mediaStream = mediaStream;
    newPeerConncection[_this.user].addStream(mediaStream);
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

    console.debug('set data object observer: ', dataObjectObserver);
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
    console.log(_this.mediaStream, _this.peerConnection);

    if (_this.mediaStream) {

      let tracks = _this.mediaStream.getTracks();

      tracks.forEach((track) => {
        track.stop();
      });
    }

    _this.peerConnection.removeStream(_this.mediaStream);
    _this.peerConnection.close();
  }

  _changePeerInformation(dataObjectObserver) {
    let _this = this;
    let data = dataObjectObserver.data;
    let isOwner = data.hasOwnProperty('ownerPeer');
    console.debug('isOwner:',isOwner);

    let peerData = isOwner ? data.ownerPeer : data.Peer;
    console.debug('Peer Data:', JSON.stringify(peerData));

    if(peerData !== 'undefined') {

      if (peerData.hasOwnProperty('connectionDescription')) {
        _this._processPeerInformation(peerData.connectionDescription);
      }

      if (peerData.hasOwnProperty('iceCandidates')) {
        console.debug('Process Peer data iceCandidates: ', peerData);
        peerData.iceCandidates.forEach(function(ice) {
          _this._processPeerInformation(ice);
        });
      }

      dataObjectObserver.onChange('*', function(event) {
        // console.debug('Observer on change message: ', event);
        _this._processPeerInformation(event.data);
      });
    }
  }

  _createAnswer() {
    let _this = this;

    _this.peerConnection.createAnswer(function(description) {
      _this._onLocalSessionCreated(description);
    }, _this._infoError);
  }

  _processPeerInformation(data) {
    let _this = this;
    // console.debug('_processPeerInformation : ', data)
    console.debug(JSON.stringify(data));

    if (data.type === 'offer' || data.type === 'answer') {
      console.debug('Process Connection Description: ', data.sdp);

      newPeerConncection[_this.user].setRemoteDescription(new RTCSessionDescription(data), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);
    }

    else if (data.id === 'receiveVideoAnswer') {
      console.debug('Process Connection Descriptionn , receiveAnswer: ', data.sdpAnswer, _this._username, data.name, newPeerConncection);
       newPeerConncection[data.name].setRemoteDescription(new RTCSessionDescription({type: 'answer', sdp: data.sdpAnswer}), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);
       console.debug('SDP answer received, setting remote description');
    }

    if (data.id === 'IceCandidate') {
      console.debug('Received message: ' , data);
      newPeerConncection[data.name] = _this.peerConnection;
      console.debug('parsedMessage Ice Candidate: ', data.candidate.candidate);
      newPeerConncection[data.name].addIceCandidate(new RTCIceCandidate({candidate: data.candidate.candidate}), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);
    }

    if(data.id  === 'newParticipantArrived') {
      console.debug('newParticipantArrived is :', data)
      _this.onNewParticipant(data);
    }
    if(data.id === 'existingParticipants') {
      console.debug('existingParticipants are :', data)
      if(data.data.length !== 0) {
        _this.onExistingParticipants(data);
      }

    }
  }

  onExistingParticipants(msg) {
    let _this = this;
     console.debug("onExistingParticipants message", msg);
     msg.data.forEach(function(senderName) {
       console.debug('------------------- is : ', senderName);
       _this.receiveVideo(senderName)
      });
  }

  receiveVideo(senderName) {
    let _this = this;
    let username = _this.user;
    console.debug('conferenceroom::receiveVideo', senderName);

    newPeerConncection[senderName] = new RTCPeerConnection(_this._configuration);

    newPeerConncection[senderName].addEventListener('signalingstatechange', function(event) {
      console.info('signalingstatechange', event.currentTarget.signalingState);
      if (event.currentTarget.signalingState === 'have-local-offer') {
        console.info('signalingstatechange - have-local-offer: ', event.currentTarget.signalingState);
      
      }

      if (event.currentTarget.signalingState === 'have-remote-offer') {
        console.info('signalingstatechange - have-remote-offer: ', event.currentTarget.signalingState);
        _this.mode = 'answer';
      }
    });

    newPeerConncection[senderName].addEventListener('iceconnectionstatechange', function(event) {
      console.info('iceconnectionstatechange', event.currentTarget.iceConnectionState, _this.dataObjectReporter);
      let data = _this.dataObjectReporter.data;
      if (data.hasOwnProperty('status')) {
        data.status = event.currentTarget.iceConnectionState;
      }
    });

    newPeerConncection[senderName].addEventListener('icecandidate', function(event) {
      // console.info('icecandidate changes', event.candidate, _this.dataObjectReporter);
      if (!event.candidate) return;
      let icecandidate = {
        type: 'candidate',
        candidate: event.candidate.candidate,
        sdpMid: event.candidate.sdpMid,
        sdpMLineIndex: event.candidate.sdpMLineIndex
      };

      if (_this.mode === 'offer') {
        data.ownerPeer.iceCandidates.push(icecandidate);
      } else {
        data.Peer.iceCandidates.push(icecandidate);
      }
    });

    _this.mode = 'RecvOnly';
    _this._createOffer(senderName, _this.mode);
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

  setLocalAndSendMessageonOffer(sessionDescription, sender) {
    let _this = this;
    console.info('setLocalAndSendMessageonOffer');
		console.debug('sessionDescription = ', sessionDescription);
    sessionDescription.sdp = _this.setRecvOnly(sessionDescription.sdp);
    console.log('Conf N to N', sessionDescription.sdp );
    _this._onLocalSessionCreated(sessionDescription, sender)
  }
  onNewParticipant(request) {
    let _this = this;
    let username = _this.username;
    console.debug('------------------onNewParticipant---------------------', request.name);
    _this.receiveVideo(request.name);
  }

  _remoteDescriptionSuccess() {
    console.info('remote success');
  }

  _remoteDescriptionError(error) {
    console.error('error: ', error);
  }

  _createOffer(sender, mode) {
    let _this = this;
    let sdp;
    console.info('################ createOffer sender #############################"', sender);
    newPeerConncection[sender].createOffer(function(description) {
      _this._onLocalSessionCreated(description, sender, mode);
    }, _this._infoError);
  }

  _onLocalSessionCreated(description, sender, mode) {

    let _this = this;
    let username = _this.user;
    let data = _this.dataObjectReporter.data;

    console.debug('-------------------------- setLocalDescription -------------------------:',  sender, _this.mode, description)
    if (mode === 'offer') {
      description.sdp = _this.setSendOnly(description.sdp);
      newPeerConncection[sender].setLocalDescription(description, function() {

        let sdpConnection = {
          sdp: description.sdp,
          type: description.type
        };

       data.ownerPeer.connectionDescription = sdpConnection;

      }, _this._infoError);
    } else {
      description.sdp = _this.setRecvOnly(description.sdp);
      newPeerConncection[sender].setLocalDescription(description, function() {

        let sdpConnection = {
          sdp: description.sdp,
          type: description.type
        };

        let msg =  {
          id : "receiveVideoFrom",
          sender : sender,
          username: username,
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
   * This function is used to receive all changes did to dataObjectObjserver.
   * @param  {Function} callback callback function
   * @return {ChangeEvent}       properties and type of changes;
   */

  // onChange(callback) {
  //   let _this = this;
  //   _this._onChange = callback;
  // }

  /**
   * This function is used to handle the peer stream
   * @return {MediaStream}           WebRTC remote MediaStream retrieved by the Application
   */
  onAddStream(callback) {
    let _this = this;
    _this._onAddStream = callback;
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

    console.log('Remote Peer Information: ', _this.dataObjectObserver.data);
    let remotePeer = _this.dataObjectObserver.data.reporter;

    return new Promise(function(resolve, reject) {
      try {
        console.info('------------------------ Syncher Create ---------------------- \n');
        syncher.create(_this._objectDescURL, [remotePeer], _this.peer)
        .then(function(dataObjectReporter) {
          console.info('2. Return the Data Object Reporter ', dataObjectReporter);

          _this.mediaStream = stream;
          _this.dataObjectReporter = dataObjectReporter;
          resolve(true);
        })
        .catch(function(reason) {
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
    // TODO: Optimize this process

    let _this = this;

    return new Promise(function(resolve, reject) {

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
   * Disable Microfone
   * @param  {boolean} value status of microfone
   * @return {boolean}
   */
  disableAudio(value) {
    let _this = this;

    return new Promise(function(resolve, reject) {

      try {
        let localStream = _this.peerConnection.getLocalStreams()[0];
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

    return new Promise(function(resolve, reject) {

      try {
        let localStream = _this.peerConnection.getLocalStreams()[0];
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

    return new Promise(function(resolve, reject) {

      try {
        let remoteStream = _this.peerConnection.getRemoteStreams()[0];
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

export default ConnectionController;
