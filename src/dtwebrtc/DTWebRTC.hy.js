/* jshint undef: true */
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';
import IdentityManager from 'service-framework/dist/IdentityManager';
import {divideURL} from '../utils/utils';
import EventEmitter from '../utils/EventEmitter'; // for receiving
import iceconfig from './stunTurnserverConfig';
import config from '../../config.json';
import { connection } from './connection';

import 'webrtc-adapter-test';

class DTWebRTC extends EventEmitter { // extends EventEmitter because we need to recieve events

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');
    super(); // call event emitter constructor to be able to receive things

    this._domain = divideURL(hypertyURL).domain;
    this._objectDescURL = 'hyperty-catalogue://catalogue.' + this._domain + '/.well-known/dataschema/Connection';
    this._syncher = new Syncher(hypertyURL, bus, configuration);
    this.discovery = new Discovery(hypertyURL, bus);
    this.identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);
    this.objObserver;
    this.objReporter;

    this.constraints = {
      'audio': true,
      'video': true
    };
    this.receivingConstraints = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    };
    this.sender = null; // sender == false --> I'm the receiver @ start
    this.myUrl = hypertyURL; // own hypertyUrl
    this.partner = null; // hypertyURL of the other hyperty
    this.pc = null; // the peer connection object of WebRTC
    this.mediaStream = null;

    // receiving starts here
    this._syncher.onNotification((event) => {
      this._onNotification(event);
    });
  }

  _onNotification(event) {
    if (this.sender == null) {
      this.sender = false;
    }
    console.info('[DTWebRTC]: Event Received: ', event);
    switch (event.type) {
      case "create":
        // ensure that a PC is existing
        this.createPC();

        // the peer has created an object and we are requested to subscribe for changes to this remote object
        this.trigger('invitation', event.identity);

        console.info("[DTWebRTC]: [_onNotification] sending event.ack() ");
        let result = event.ack(); // Acknowledge reporter about the Invitation was received
        console.info("[DTWebRTC]: [_onNotification] event.ack() result is:", result);

        setTimeout( () => {
          // Subscribe to Object
          this._syncher.subscribe(this._objectDescURL, event.url).then((objObserver) => {
            console.info("[DTWebRTC]: [_onNotification] objObserver ", objObserver);
            // if successful, we get an observer object back
            this.objObserver = objObserver

            // if we are not the initiator of the call, then signal and handle this invite
            if (! this.sender) {
              this.partner = event.from;
              console.log('got invite');
              this.trigger('incomingcall', objObserver.data);
            }

            this.changePeerInformation(objObserver);
          }).catch((reason) => {
            console.error(reason);
          });
        }, 750);
        break;
      case "delete":
        this.cleanupPC();
        this.trigger('disconnected');
        break;
    }
  }

  /**
    Establishing a connection to the remote side by invoking syncher.subscribe.
    This will be called for the invite as well as for the the accept. It returns
    an objectReporter object, if successfully.
   **/
  connect(hypertyURL) {
    this.partner = hypertyURL;
    if (this.sender == null) {
      this.sender = true;
    }

    return new Promise((resolve, reject) => {
      // initial data for sync object
      let dataObject = connection;
      // prepare dataObject for offer or answer
      if (this.sender) {  // offer
            dataObject.name = "Connection";
            dataObject.status = "";
            dataObject.owner = this.myUrl;
            dataObject.peer = this.partner;
      } else {  // answer
        dataObject.Peer = {
          connectionDescription: {},
          iceCandidates: []
        };
      }

      // ensure this the objReporter object is created before we create the offer
      this._syncher.create(this._objectDescURL, [hypertyURL], dataObject).then((objReporter) => {
          console.info('1. Return Created WebRTC Object Reporter', objReporter);
          this.objReporter = objReporter;
          if (this.sender) {  // offer
            this.invite().then( (offer) => {
                this.objReporter.data.ownerPeer = {
                  connectionDescription: offer,
                  iceCandidates: []
                };
              });
          }

          objReporter.onSubscription(function(event) {
            console.info('-------- Receiver received subscription request --------- \n');
            event.accept(); // all subscription requested are accepted
            resolve(objReporter);
          });
        })
        .catch(function(reason) {
          console.error(reason);
          reject(reason);
        });
    });
  }

  // WEBRTC FUNCTIONS HERE
  setMediaOptions(opt) {
    this.constraints = opt;
  }

  // caller invites a callee
  invite() {
    this.createPC();
    return new Promise((resolve, reject) => {
      console.log('>>>Constrains', this.constraints);
      navigator.mediaDevices.getUserMedia(this.constraints).then((stream) =>{
          console.log("[DTWebRTC]: localviodeo")
          this.trigger('localvideo', stream);
          //document.getElementById('localVideo').srcObject = stream;
          this.mediaStream = stream;
          this.pc.addStream(stream);
            // this.pc.createOffer(this.receivingConstraints).then( (offer) => {
            this.pc.createOffer().then( (offer) => {
              this.pc.setLocalDescription(new RTCSessionDescription(offer), () => {
                resolve(offer);
              }, function() {
                reject();
              })
            })
            .catch((e) => {
              reject("Create Offer failed: ", e);
            });
        });
    });
  }

  // calle accepted the invitation
  invitationAccepted(data) {
    let offer;
    if (data.ownerPeer.connectionDescription.type == "offer") {
      console.log("[DTWebRTC]: OFFER RECEIVED: ", data)
      offer = data.ownerPeer.connectionDescription;
    } else {
      console.log("[DTWebRTC]: offer was't set in the invitation - data: ", data);
      return;
    }
    console.log('>>>Constraints', this.constraints);
    navigator.mediaDevices.getUserMedia(this.constraints).then( (stream) => {
      this.trigger('localvideo', stream);
      this.mediaStream = stream;
      this.pc.addStream(stream); // add the stream to the peer connection so the other peer can receive it later
      this.pc.setRemoteDescription(new RTCSessionDescription(offer), () => {
        // connect to the other hyperty now
        this.connect(this.partner).then( (objReporter) => {
          console.log("[DTWebRTC]: objReporter created successfully: ", objReporter);
          this.objReporter = objReporter;

          this.pc.createAnswer().then( (answer) => {
            this.objReporter.data.Peer.connectionDescription = answer;
            this.pc.setLocalDescription(new RTCSessionDescription(answer), () => {
              console.log("[DTWebRTC]: localDescription (answer) successfully set: ", answer);
            });
          });
        });
      });
    });
  }

  // choose ICE-Server(s), if (mode != 0) use only Stun/Turn from Settings-GUI
  setIceServer(ice, mode) {
    iceconfig.ice = mode ? ice : ice.concat(iceconfig.ice);
  }

  //create a peer connection with its event handlers
  createPC() {
    if ( this.pc )
      return;

    this.pc = new RTCPeerConnection({
      'iceServers': iceconfig.ice
    });
    console.log("[DTWebRTC]: created PeerConnection", this.pc);

    //event handler for when remote stream is added to peer connection
    this.pc.onaddstream = (obj) => {
      console.log('[DTWebRTC]: >>>onaddstream', this.pc);
      this.trigger('remotevideo', obj.stream);
    }

    //event handler for when local ice candidate has been found
    this.pc.onicecandidate = (e) => {
      console.log("[DTWebRTC]: icecandidateevent occured: ", e)
      if (!e.candidate) return;
      let icecandidate = {
        type: 'candidate',
        candidate: e.candidate.candidate,
        sdpMid: e.candidate.sdpMid,
        sdpMLineIndex: e.candidate.sdpMLineIndex
      };

      if (! this.objReporter ) {
        console.log("[DTWebRTC]: got  iceCandidate before objReporter ... skipping");
        return;
      }
      if (this.sender) {
        this.objReporter.data.ownerPeer.iceCandidates.push(icecandidate);
      } else {
        this.objReporter.data.Peer.iceCandidates.push(icecandidate);
      }
    }

    // unfortunately onremovestream() didn't recognizes the remove of a stream

    this.pc.onRemoteStreamRemoved = (a) => {
      console.log('>>>stream removed from remote', a);
    }
  }

  ////////////////////////////////////

  // HypertyConnector functions
  changePeerInformation(dataObjectObserver) {
    let data = dataObjectObserver.data;
    console.log("[DTWebRTC]: changePeerInformation: data", data);
    let peerData = data.Peer ? data.Peer : data.ownerPeer;
    console.info("[DTWebRTC]: Peer Data:", peerData);

    if (peerData.hasOwnProperty('connectionDescription')) {
      this.processPeerInformation(peerData.connectionDescription);
    }

    if (peerData.hasOwnProperty('iceCandidates')) {
      peerData.iceCandidates.forEach( (ice) => {
        console.log("[DTWebRTC]: changePeerInformation for ice", ice);
        this.processPeerInformation(ice);
      });
    }

    dataObjectObserver.onChange('*', (event) => {
      console.info('[DTWebRTC]: Observer on change message: ', event);

      // this event also includes the answer from the callee so we need to
      // process the answer from event.data and the candidates which might trickle
      // from event.data[0]
      if (event.data[0]) { // [0] this does the trick when ice candidates are trickling ;)
        console.log('>>event.data[0]', event.data[0]);
        this.processPeerInformation(event.data[0]);
      } else {
        console.log('[DTWebRTC]: >>event', event);
        this.processPeerInformation(event.data);
      }
    });
  }

  processPeerInformation(data) {
    console.info("[DTWebRTC]: processPeerInformation: ", JSON.stringify(data));
    //this.createPC();
    if ( ! this.pc ) {
      console.info("[DTWebRTC]: processPeerInformation: no PeerConnection existing --> maybe in disconnecting process. --> ignoring this update");
      return;
    }

    if (data.type === 'offer' || data.type === 'answer') {
      // if (data.type === 'answer') {
      console.info('[DTWebRTC]: Process Connection Description: ', data);
      this.pc.setRemoteDescription(new RTCSessionDescription(data)).then(() => {
        console.log("[DTWebRTC]: remote success")
      })
      .catch((e) => {
        console.log("[DTWebRTC]: remote error: ", e)
      });
    }

    if (data.candidate) {
      console.info('Process Ice Candidate: ', data);
      this.pc.addIceCandidate(new RTCIceCandidate({
        candidate: data.candidate
      }));
    }
  }

  cleanupPC() {
    this.sender = null;
    if ( this.mediaStream ) {
      let tracks = this.mediaStream.getTracks();
      tracks.forEach((track) => { track.stop() } );
      if ( this.pc ) {
        this.pc.removeStream(this.mediaStream);
      }
    }
    if ( this.pc ) this.pc.close();
    this.pc = null;
  }

  disconnect() {
    console.log('[DTWebRTC]>>>lets disconnect', this);
    return new Promise( (resolve, reject) => {
      try {
        if (this.objReporter) {
          this.objReporter.delete();
        }
        if (this.objObserver) {
          this.objObserver.delete();
        }
        this.cleanupPC();

        this.trigger('disconnected');
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
  switchLocalAudio(newState) {
    console.log('[DTWebRTC] --> setting local audio to: ' + newState);
    try {
      this.mediaStream.getAudioTracks()[0].enabled = newState;
    }
    catch (x) {
      console.err("error while (un)muting local audio state!")
    }
  }
  switchLocalVideo(newState) {
    console.log('[DTWebRTC] --> setting local video to: ' + newState);
    try {
      this.mediaStream.getVideoTracks()[0].enabled = newState;
    }
    catch (x) {
      console.err("error while (un)muting local video state!")
    }
  }
}


export default function activate(hypertyURL, bus, configuration) {
  return {
    name: 'DTWebRTC',
    instance: new DTWebRTC(hypertyURL, bus, configuration)
  };
}
