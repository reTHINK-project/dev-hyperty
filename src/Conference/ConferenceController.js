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


class ConferenceController {

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
    newPeerConncection[username] = new RTCPeerConnection(_this._configuration.webrtc);
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

      if (!event.candidate) return;

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
    newPeerConncection[username].addEventListener('addstream', function(event) {
      console.info('Remote stream added to PeerConnection: ', event);

      if (_this._onAddStream) _this._onAddStream(event, username);
    });

    newPeerConncection[username].onremovestream = function(event) {
      console.info('Stream removed: ', event);
    };

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

    // if (_this.mode === 'offer') {
    //   _this._createOffer();
    // } else {
    //   _this._createAnswer();
    // }

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
    // let isOwner = data.hasOwnProperty('ownerPeer');
    // console.debug('isOwner:',isOwner);

  // New model
    let peerData = dataObjectObserver.data;

    // let peerData = isOwner ? data.ownerPeer : data.Peer;
    console.info('[Conference ConnectionController ] Peer Data:', JSON.stringify(peerData));

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

      newPeerConncection[_this.user].setRemoteDescription(new RTCSessionDescription(data), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);

    }

    else if (data.id === 'receiveVideoAnswer') {
      console.debug('Process Connection Descriptionn , receiveAnswer: ', data.sdpAnswer, _this._username, data.name, newPeerConncection);
       newPeerConncection[data.name].setRemoteDescription(new RTCSessionDescription({type: 'answer', sdp: data.sdpAnswer}), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);
    }

    if (data.type === 'candidate') {
      console.info('[Conference ConnectionController ] Process Ice Candidate: ', data);
         let parsedCandidate = {
           type: 'candidate',
           candidate:data.candidate,
           sdpMid:data.sdpMid,
           sdpMLineIndex:data.sdpMLineIndex
         }
        console.debug('parsedCandidate : ', parsedCandidate.candidate);
       newPeerConncection[data.name].addIceCandidate(new RTCIceCandidate({candidate:parsedCandidate.candidate}), _this._remoteDescriptionSuccess, _this._remoteDescriptionError);
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
      _this.receiveVideo(senderName).then((result) => {
        console.debug('##### On receiveVideo from ########', result)
        _this.mode = 'RecvOnly';
        _this._createOffer(senderName, _this.mode);
      });
    });
  }

  receiveVideo(senderName) {
    let _this = this;
    let username = _this.user;
    let data = _this.dataObjectReporter.data;

    console.debug('conferenceroom::receiveVideo', senderName);
    return new Promise((resolve, reject) => {
      try {
        newPeerConncection[senderName] = new RTCPeerConnection(_this._configuration.webrtc);
        console.debug('_this._username is :', _this.user, username);

        newPeerConncection[senderName].addEventListener('signalingstatechange', (event) => {

          console.info('signalingstatechange', event.currentTarget.signalingState);

          if (event.currentTarget.signalingState === 'have-local-offer') {
            console.info('signalingstatechange - have-local-offer: ', event.currentTarget.signalingState);
          }

          if (event.currentTarget.signalingState === 'have-remote-offer') {
            console.info('signalingstatechange - have-remote-offer: ', event.currentTarget.signalingState);
            // _this.mode = 'answer';
          }

        });

        newPeerConncection[senderName].addEventListener('iceconnectionstatechange', (event) => {
          console.info('iceconnectionstatechange', event.currentTarget.iceConnectionState, _this.dataObjectReporter);

          if (data.hasOwnProperty('status')) {
            data.status = event.currentTarget.iceConnectionState;
          }
        });

        newPeerConncection[senderName].addEventListener('icecandidate', (event) => {

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
        newPeerConncection[senderName].addStream(_this._mediaStream);

        // Add stream to PeerConnection
        newPeerConncection[senderName].addEventListener('addstream', (event) => {
          console.debug('Add Stream: ', event);

          // newPeerConncection[senderName].addStream(_this._mediaStream);
          console.log('/************************* _this._onAddStream :', _this._onAddStream)

          if (_this._onAddStream)  _this._onAddStream(event, senderName);
        });

        newPeerConncection[senderName].onremovestream = (event) => {
          console.info('Stream removed: ', event);
        };

     } catch (e) {
        reject('error accepting connection');
      }
      resolve(newPeerConncection[senderName]);
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
    let userName = _this.username;
    console.debug('------------------onNewParticipant---------------------', request.name);
    _this.receiveVideo(request.name).then((result) => {
      console.debug('##### On receiveVideo from ########', result)
      _this.mode = 'RecvOnly';
      _this._createOffer(request.name, _this.mode);
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
    let sdescription;

    console.info('################ createOffer sender #############################"', senderName);
    return new Promise((resolve, reject) => {
      newPeerConncection[senderName].createOffer().then((description) => {
        console.debug('created offer is : ', description)
        sdescription = description;
        return _this._onLocalSessionCreated(description, senderName, mode);
      }).then(() => {
        // _this.sendToServer(sdescription, mode, senderName);
      }) .catch((reason) => {
        // An error occurred, so handle the failure to connect
        console.error('[Error] has occured, reason :', reason);
      });
    })
  }
  _onLocalSessionCreated(description, senderName, mode) {

    let _this = this;
    let userName = _this.user;
    let data = _this.dataObjectReporter.data;

    console.debug('-------------------------- setLocalDescription -------------------------:',mode ,  senderName, _this.mode, description)
    if (mode === 'offer') {
      description.sdp = _this.setSendOnly(description.sdp);
      newPeerConncection[senderName].setLocalDescription(description, () => {

        let sdpConnection = {
          senderName: senderName,
          userName: userName,
          sdp: description.sdp,
          type: description.type
        };
        // new model
        data.connectionDescription = sdpConnection;

      //  data.ownerPeer.connectionDescription = sdpConnection;


      }, _this._infoError);
    } else {
      description.sdp = _this.setRecvOnly(description.sdp);
      newPeerConncection[senderName].setLocalDescription(description, () => {

        let sdpConnection = {
          sdp: description.sdp,
          type: description.type
        };

        let msg =  {
          id : "receiveVideoFrom",
          senderName : senderName,
          userName: userName,
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
    console.debug(' name is :', username )
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
   * Disable Microfone
   * @param  {boolean} value status of microfone
   * @return {boolean}
   */
  disableAudio(value) {
    let _this = this;

    return new Promise((resolve, reject) => {

      try {
        let localStream = newPeerConncection[_this.user].getLocalStreams()[0];
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
        let localStream = newPeerConncection[_this.user].getLocalStreams()[0];
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
        let remoteStream = newPeerConncection[_this.user].getLocalStreams()[0];
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
