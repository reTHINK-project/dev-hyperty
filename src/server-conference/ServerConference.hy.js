/* jshint undef: true */
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';
// import {divideURL} from '../utils/utils';
import EventEmitter from '../utils/EventEmitter'; // for receiving
import RoomController from './RoomController';
import IdentityManager from 'service-framework/dist/IdentityManager';
import { connection } from './connection';

import peer from './peer';

// Configuration of kurento media server




//Table used to keep rooms
let rooms = {};
let participants = [];


export function divideURL(url) {

  // let re = /([a-zA-Z-]*)?:\/\/(?:\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*/gi;
  let re = /([a-zA-Z-]*):\/\/(?:\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256})([-a-zA-Z0-9@:%._\+~#=\/]*)/gi;
  let subst = '$1,$2,$3';
  let parts = url.replace(re, subst).split(',');

  // If the url has no protocol, the default protocol set is https
  if (parts[0] === url) {
    parts[0] = 'https';
    parts[1] = url;
  }

  let result = {
    type: parts[0],
    domain: parts[1],
    identity: parts[2]
  };
  return result;
}



class ServerConference extends EventEmitter {

  /**
  * Create a new roomDataObjectReporter
  * @param  {Syncher} syncher - Syncher provided from the runtime core
  */

  constructor(hypertyURL, bus, configuration) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    super(); // call event emitter constructor to be able to receive things

    this.domain = divideURL(hypertyURL).domain;
    this.objectDescURL = 'hyperty-catalogue://catalogue.' + this.domain +'/.well-known/dataschema/Connection';
    // this.userStatusDescURL = 'hyperty-catalogue://catalogue.' + this.domain +'/.well-known/dataschema/Communication';
    this.syncher = new Syncher(hypertyURL, bus, configuration);
    this.discovery = new Discovery(hypertyURL, bus);
    this.identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);
    this.configuration = configuration;
  
    this.peer = peer;
    this.objObserver = {};
    this.objReporter = {};
    this.roomsObj = {};// holds room Object by roomName. this.roomsObj[roomName]
    this.roomController = {};
    this.scheme = ['connection'];
    this.resources = ['audio', 'video'];
    this.connectionObject = connection;
    this.callerIdentity;
    this.sender = null; // sender == false --> I'm the receiver @ start
    this.myUrl = hypertyURL; // own hypertyUrl
    this.partner = null; // hypertyURL of the other hyperty

    // receiving starts here
    this.syncher.onNotification((event) => {
       let _this = this;
      _this.onNotification(event);
    });

  }

  onNotification(event) {
     let _this = this;  

    console.log('serverConference :: event is :', event);
    console.log('serverConference :: event.from is :', event.from);
    event.ack();
    _this.callerIdentity = event.identity;
    switch(event.type) {
      case "create":
        //console.log('serverConference switch create :');
        if (_this.roomController[event.from]) {
          _this.autoSubscribe(event);
        } else {
          _this.autoAccept(event);
        }
        console.log('------------------------ End Create ---------------------- \n');
      break;

      case "delete":
        this.trigger('disconnected');
      break;

      default:

        // let data = {
        //   id: 'error',
        //   message: 'Invalid message ' + message
        // };
        // this.sendMessage(event.url, data);
      break;

    }
  }
  
  autoSubscribe(event) {

    console.log('serverConference :: autoSubscribe');

    let _this = this;
    let syncher = _this.syncher;
  
    console.log('---------------- Syncher Subscribe (Auto Subscribe) ---------------- \n');

    syncher.subscribe(_this.objectDescURL, event.url).then(function(dataObjectObserver) {
      console.log('1.[autoSubscribe], Return Subscribe Data Object Observer:', dataObjectObserver);

      //console.log('_this.roomController[event.from]:', _this.roomController[event.from]);
      //console.log('event.from:', event.from);
      _this.roomController[event.from].dataObjectObserver = dataObjectObserver;

      //console.log('autoSubscribe après set dataObjectObserver');
    }).catch(function(reason) {
      console.error(reason);
    });
  }

  autoAccept(event) {

    console.log('serverConference :: autoAccept');

    let _this = this;
    let syncher = _this.syncher;
    console.log('---------------- Syncher Subscribe (Auto Accept) ---------------- \n');

    syncher.subscribe(_this.objectDescURL, event.url ).then(function(dataObjectObserver) {
      console.log('1. [autoAccept], Return Subscribe Data Object Observer', dataObjectObserver.data);

      let roomController = new RoomController(syncher, _this.domain, _this.configuration);
      roomController.connectionEvent = event;
      // we get the sdp offer
      roomController.roomName = dataObjectObserver.data.roomName;
      roomController.dataObjectObserver = dataObjectObserver;
      _this.roomController[event.from] = roomController;
 
      console.log('_this._controllers[event.from] : ', _this.roomController[event.from])

      // TODO: user object with {identity: event.identity, assertedIdentity: assertedIdentity}
      if (_this.onInvitation) _this.onInvitation(roomController, event.identity.userProfile);

      console.log('------------------------ END ---------------------- \n');
    }).catch(function(reason) {
      console.error(reason);
    });
  }

   onInvitation(callback) {
    let _this = this;
    _this.onInvitation = callback;
  }


  sendMessage(toUser, message) {
    console.log('------------ sendMessage to user : ----------------\n', toUser);

    let _this = this;
    let syncher = _this.syncher;
    let toHyperty = toUser.userHypertyURL; 
    
    console.log('------------ sendMessage:', message ,'to toHyperty : ----------------\n', toHyperty);

    return new Promise((resolve, reject) => {
      
      // let dataObject = {
      //   name : 'connection',
      //   type: "response",
      //   from: _this.myUrl,
      //   to: toUser,
      //   status : "",
      //   data : message
      // };
       // Initial data
      // _this.connectionObject.name = 'connection';
      // _this.connectionObject.scheme = 'connection';
       // _this.connectionObject.status = '';
        let participant = {};
        participant.owner = _this.myUrl;
        participant.message = message;
       
     
      console.log('------------ _this.connectionObject: ----------------\n', _this.connectionObject);
      // create ObjectReporter to communicate with specific client hyperty
      syncher.create(_this.objectDescURL, [toHyperty], participant).then((objReporter) => {
        console.log('Create conference participant Object Reporter: ', objReporter.data);
        objReporter.onSubscription((event) => {
          console.log('-------- Receiver peer Hyperty subscription request --------- \n');
          event.accept();
          resolve(objReporter);
        });
      }).catch((reason) => {
        console.error('Error occured while connect to HypertyURL: ' + tohypertyURL + " reason:", reason);
        reject(reason);
      });
    });
  }

   create(controller, roomName) {
    let _this = this;
    let remotePeer = controller.dataObjectObserver.data.reporter;

    return new Promise((resolve, reject) => {
      _this.createSyncher(remotePeer)
      .then((dataObjectReporter) => {
        _this.objReporter = dataObjectReporter;
        dataObjectReporter.onSubscription((event) => {
          console.log('-------- Status Reporter received subscription request ---------\n');
          event.accept();
          resolve(dataObjectReporter);       
        });
      
      }).catch(function(reason) {
        reject(reason);
      });

    });

  }

  createSyncher(remotePeer) {
    let _this = this;
    return _this.syncher.create(_this.objectDescURL, [remotePeer], _this.peer);
  }
}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'ServerConference',
    instance: new ServerConference(hypertyURL, bus, configuration)
  };

}
