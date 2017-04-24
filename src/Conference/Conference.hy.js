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

// Service Framework
import IdentityManager from 'service-framework/dist/IdentityManager';
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import {divideURL} from '../utils/utils';

// Internals
import ConferenceController from './ConferenceController';
import { connection } from './connection';
import Search from '../utils/Search';

/**
 *
 */
class Conference {

  /**
  * Create a new Hyperty Connector
  * @param  {Syncher} syncher - Syncher provided from the runtime core
  */
  constructor(hypertyURL, bus, configuration) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    this.hypertyURL = hypertyURL;
    this.bus = bus;
    this.configuration = configuration;
    this.domain = divideURL(hypertyURL).domain;

      _this.objectDescURL = 'hyperty-catalogue://catalogue.' + this.domain +'/.well-known/dataschema/Connection'

    this.controllers = {};
    this.connectionObject = connection;
    this.participants = {};
    this.myId = {};

    let discovery = new Discovery(hypertyURL, configuration.runtimeURL, bus);
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);


    this.discovery = discovery;
    this.identityManager = identityManager;

    this.search = new Search(discovery, identityManager);

    console.log('Discover: ', discovery);
    console.log('Identity Manager: ', identityManager);

    let syncher = new Syncher(hypertyURL, bus, configuration);

    syncher.onNotification((event) => {
      let _this = this;
      console.debug('---------------------------------------------------- On Notification: ', event);

      if (event.type === 'create') {
        console.debug('------------ Acknowledges the Reporter - Create ------------ \n');
        event.ack(200);
        if (_this.controllers[event.from]) {
          _this.autoSubscribe(event);
        } else {
          _this.autoAccept(event);
        }
        console.debug('------------------------ End Create ---------------------- \n');
      }

      if (event.type === 'delete') {
        console.info('------------ Acknowledges the Reporter - Delete ------------ \n');
        event.ack(200);
        console.debug(_this.controllers);
        if (_this.controllers) {
          Object.keys(_this.controllers).forEach((controller) => {
            _this.controllers[controller].deleteEvent = event;
            delete _this.controllers[controller];
          });
        }
        console.info('------------------------ End Create ---------------------- \n');
      }
    });
    _this.syncher = syncher;
  }

  autoSubscribe(event) {
    let _this = this;
    let syncher = _this.syncher;
    console.debug(' this is:', _this)

    console.debug('---------------- Syncher Subscribe (Auto Subscribe) ---------------- \n');
    console.debug('Subscribe URL Object ', event);

    syncher.subscribe(_this.objectDescURL, event.url).then(function(dataObjectObserver) {
      console.debug('1. Return Subscribe Data Object Observer', dataObjectObserver);
      _this.controllers[event.from].dataObjectObserver = dataObjectObserver;

      if((event.value.data.id === 'existingParticipants') || (event.value.data.id === 'iceCandidate')) {
           console.debug('event.value.data is:', event );
         _this.controllers[event.from]._processPeerInformation(event.value.data);
      }
    }).catch(function(reason) {
      console.error(reason);
    });
  }

  autoAccept(event) {
    let _this = this;
    let syncher = _this.syncher;

    console.debug('---------------- Syncher Subscribe (Auto Accept) ---------------- \n');
    console.debug('Subscribe URL Object of the other peer : ', event);

    syncher.subscribe(_this.objectDescURL, event.url ).then(function(dataObjectObserver) {
      console.debug('1. Return Subscribe Data Object Observer', dataObjectObserver);

      let conferenceController = new ConferenceController(syncher, _this.domain, _this.configuration);
      conferenceController.connectionEvent = event;
      // we get the sdp offer
      conferenceController.dataObjectObserver = dataObjectObserver;

      _this.controllers[event.from] = conferenceController;


      // TODO: user object with {identity: event.identity, assertedIdentity: assertedIdentity}
      if (_this.onInvitation) _this.onInvitation(conferenceController, event.identity.userProfile);

      console.debug('------------------------ END ---------------------- \n');
    }).catch(function(reason) {
      console.error(reason);
    });
  }

  /**
   * This function is used to create a new connection providing the identifier of the user to be notified.
   * @param  {URL.UserURL}        userURL      user to be invited that is identified with reTHINK User URL.
   * @param  {MediaStream}        stream       WebRTC local MediaStream retrieved by the Application
   * @param  {string}             name         is a string to identify the connection.
   * @return {<Promise>conferenceController}   A conferenceController object as a Promise.
   */
  connect(userURL, stream, roomID, domain) {
    // TODO: Pass argument options as a stream, because is specific of implementation;
    // TODO: CHange the hypertyURL for a list of URLS
    let _this = this;
    let syncher = _this.syncher;
    let scheme = ['connection'];
    let resource = ['audio', 'video'];

    console.debug('connecting to user : ', userURL);
    console.debug('roomID is :', roomID);

    return new Promise((resolve, reject) => {

      let conferenceController;
      let selectedHyperty;
      console.info('------------------------ Syncher Create ---------------------- \n');

      _this.search.myIdentity().then(function(identity) {

        console.debug('connector searching: ', [userURL], `at domain `, [domain]);
        console.debug('identity: ', identity, _this.connectionObject);
        _this.myId = identity;

        return _this.search.users([userURL], [domain], scheme, resource);
      }).then((hypertiesIDs) => {

        selectedHyperty = hypertiesIDs[0].hypertyID;
        // selectedHyperty = hypertiesIDs;

        let roomName = roomID;

        console.info('It supports  group communication, selected hyperty: ', selectedHyperty);

        let connectionName = 'Connection';
        if (roomID) {
          connectionName = roomID;
        }

        // Initial data
        // _this.connectionObject.usename = _this.myId;
        _this.connectionObject.name = connectionName;
        _this.connectionObject.roomName = roomID;
        _this.connectionObject.scheme = 'connection';
        _this.connectionObject.owner = _this.hypertyURL;
        // _this.connectionObject.peer = selectedHyperty;
        _this.connectionObject.status = '';
        return syncher.create(_this.objectDescURL, [selectedHyperty], _this.connectionObject);
      }).catch((reason) => {
        console.error(reason);
        reject(reason);
      }).then((dataObjectReporter) => {
        console.debug('1. Return Create Data Object Reporter', dataObjectReporter);
        console.debug('2. Return syncher', syncher);

        conferenceController = new ConferenceController(syncher, _this.domain, _this.configuration, _this.myId.username);

        console.debug('_this.myId is:', _this.myId);
        conferenceController.username = _this.myId.username;
        conferenceController.mediaStream = stream;
        conferenceController.dataObjectReporter = dataObjectReporter;

        _this.controllers[selectedHyperty] = conferenceController;
        resolve(conferenceController);
        console.info('--------------------------- END --------------------------- \n');
      }).catch((reason) => {
        console.error(reason);
        reject(reason);
      });

    });
  }

  /**
   * This function is used to handle notifications about incoming requests to create a new connection.
   * @param  {Function} callback
   * @return {event}
   */
  onInvitation(callback) {
    let _this = this;
    _this.onInvitation = callback;
  }
}


/**
 * Function will activate the hyperty on the runtime
 * @param  {URL.URL} hypertyURL   url which identifies the hyperty
 * @param  {MiniBus} bus          Minibus used to make the communication between hyperty and runtime;
 * @param  {object} configuration configuration
 */
export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'Conference',
    instance: new Conference(hypertyURL, bus, configuration)
  };

}
