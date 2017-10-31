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
import {Discovery} from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import {divideURL, isLegacy} from '../utils/utils';

// Internals
import ConnectionController from './ConnectionController';
import { connection } from './connection';
import Search from '../utils/Search';

/**
 *
 */
class Connector {

  /**
  * Create a new Hyperty Connector
  * @param  {Syncher} syncher - Syncher provided from the runtime core
  */
  constructor(hypertyURL, bus, configuration) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    _this._hypertyURL = hypertyURL;
    _this._bus = bus;
    _this._configuration = configuration;
    _this._domain = divideURL(hypertyURL).domain;

    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschema/Connection';

    _this._controllers = {};
    _this.connectionObject = connection;

    let discovery = new Discovery(hypertyURL, configuration.runtimeURL, bus);
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

    _this.discovery = discovery;
    _this.identityManager = identityManager;

    _this.search = new Search(discovery, identityManager);

    console.log('Discover: ', discovery);
    console.log('Identity Manager: ', identityManager);

    let syncher = new Syncher(hypertyURL, bus, configuration);

    syncher.onNotification((event) => {

      console.log('On Notification: ', event);
      console.log('This Controllers: ', _this._controllers);

      if (event.type === 'create') {
        console.info('------------ Acknowledges the Reporter - Create ------------ \n');
        event.ack(200);

        if (_this._controllers[event.from]) {
          _this._autoSubscribe(event);
        } else {
          _this._autoAccept(event);
        }

        console.info('------------------------ End Create ---------------------- \n');

      }

      if (event.type === 'delete') {
        console.info('------------ Acknowledges the Reporter - Delete ------------ \n');
        event.ack(200);

        console.log(_this._controllers);
        if (_this._controllers) {
          Object.keys(_this._controllers).forEach((controller) => {
            _this._controllers[controller].deleteEvent = event;
            delete _this._controllers[controller];

            console.log('deleted Controllers:', _this._controllers);
          });
        }

        console.info('------------------------ End Create ---------------------- \n');
      }

    });

    _this._syncher = syncher;

    let msgToInit = {
        type: 'init', from: hypertyURL, to: 'sip://test@rethink-project.eu',
        body: {source: hypertyURL, schema: _this._objectDescURL}
    };

    // bus.postMessage(msgToInit, (reply) => {
    // });

  }

  // callback when connection Controllers are disconnected

  _removeController(controllers, controller) {
    let _this = this;

    if (controllers) {
        delete controllers[controller];

        console.log('[Connector] removed controller for ', controller);
      }
  }

  _autoSubscribe(event) {
    let _this = this;
    let syncher = _this._syncher;

    console.info('---------------- Syncher Subscribe (Auto Subscribe) ---------------- \n');
    console.info('Subscribe URL Object ', event);

    syncher.subscribe(_this._objectDescURL, event.url).then(function(dataObjectObserver) {
      console.info('1. Return Subscribe Data Object Observer', dataObjectObserver);
      _this._controllers[event.from].dataObjectObserver = dataObjectObserver;
    }).catch(function(reason) {
      console.error(reason);
    });
  }

  _autoAccept(event) {
    let _this = this;
    let syncher = _this._syncher;

    console.info('---------------- Syncher Subscribe (Auto Accept) ---------------- \n');
    console.info('Subscribe URL Object ', event);
    syncher.subscribe(_this._objectDescURL, event.url ).then(function(dataObjectObserver) {
      console.info('1. Return Subscribe Data Object Observer', dataObjectObserver);
      let connectionController;
      if (!event.from.includes('sip')) {
        _this._GlobalHyperty = event.from;
        console.log('Non Legacy ');
        connectionController = new ConnectionController(syncher, _this._domain, _this._configuration,  _this._removeController, _this, event.from);
        connectionController.connectionEvent = event;
        connectionController.dataObjectObserver = dataObjectObserver;

        let identity = event.identity;

        let ongoingCall;

        if (Object.keys(_this._controllers).length > 0) {      // check if there an ongoing call
          ongoingCall = true;
        }

        _this._controllers[event.from] = connectionController;

        if (!identity) {
          identity = {};
          identity.userProfile = {
            avatar: "https://www.mybloggerguides.com/wp-content/uploads/2016/01/anonymous_avatar.png",
            cn: 'anonymous',
            userURL: 'anonymous',
            username: "anonymous"
              };
            }

        if (ongoingCall) {
          // ongoing call lets decline we busy
          connectionController.decline(486, 'Busy Here');
        }

        if (_this._onInvitation) {
          // TODO: user object with {identity: event.identity, assertedIdentity: assertedIdentity}
         _this._onInvitation(connectionController, identity.userProfile);
        }
      } else {
        _this._controllers[_this._GlobalHyperty].dataObjectObserver = dataObjectObserver;
        connectionController = _this._controllers[_this._GlobalHyperty];
      }



      console.info('------------------------ END ---------------------- \n');
    }).catch(function(reason) {
      console.error(reason);
    });
  }

  /**
   * This function is used to create a new connection providing the identifier of the user to be notified.
   * @param  {URL.UserURL}        userURL      user to be invited that is identified with reTHINK User URL.
   * @param  {MediaStream}        stream       WebRTC local MediaStream retrieved by the Application
   * @param  {string}             name         is a string to identify the connection.
   * @return {<Promise>ConnectionController}   A ConnectionController object as a Promise.
   */
  connect(userURL, stream, name, domain, resource = ['audio', 'video']) {
    // TODO: Pass argument options as a stream, because is specific of implementation;
    // TODO: CHange the hypertyURL for a list of URLS
    let _this = this;
    let syncher = _this._syncher;
    let scheme = ['connection'];

    console.log('connecting: ', userURL);

    return new Promise(function(resolve, reject) {

      let connectionController;
      let selectedHyperty;
      console.info('------------------------ Syncher Create ----------------------  \n');

      _this.search.myIdentity().then(function(identity) {

        console.log('connector searching: ', [userURL], `at domain `, [domain]);
        console.log('identity: ', identity, _this.connectionObject);

        return _this.search.users([userURL], [domain], scheme, resource);
      })
      .then(function(hypertiesIDs) {

        // Only support one to one connection;*/
        selectedHyperty = hypertiesIDs[0].hypertyID;
        console.info('Only support communication one to one, selected hyperty: ', selectedHyperty);

        let connectionName = 'Connection';
        if (name) {
          connectionName = name;
        }

        // Initial data
        _this.connectionObject.name = connectionName;
        _this.connectionObject.scheme = 'connection';
        _this.connectionObject.owner = _this._hypertyURL;
        _this.connectionObject.peer = selectedHyperty;
        _this.connectionObject.status = '';
        _this._GlobalHyperty = selectedHyperty;

        return syncher.create(_this._objectDescURL, [selectedHyperty], _this.connectionObject, false, false, name, {}, {resources: resource});
      })
      .catch(function(reason) {
        console.error(reason);
        reject(reason);
      })
      .then(function(dataObjectReporter) {
        console.info('1. Return Create Data Object Reporter', dataObjectReporter);

        connectionController = new ConnectionController(syncher, _this._domain, _this._configuration, _this._removeController, _this, selectedHyperty);
        connectionController.mediaStream = stream;
        connectionController.dataObjectReporter = dataObjectReporter;
        _this._controllers[selectedHyperty] = connectionController;
        console.log('CONTROLLERS:', _this._controllers);
        resolve(connectionController);
        console.info('--------------------------- END --------------------------- \n');
      })
      .catch(function(reason) {
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
    _this._onInvitation = callback;
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
    name: 'Connector',
    instance: new Connector(hypertyURL, bus, configuration)
  };

}
