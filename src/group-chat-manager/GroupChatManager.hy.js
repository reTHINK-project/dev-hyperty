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

// Service Framework
import IdentityManager from 'service-framework/dist/IdentityManager';
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import {divideURL} from '../utils/utils';
import Search from '../utils/Search';

// Internals
import { communicationObject, CommunicationStatus } from './communication';
import ChatController from './ChatController';

/**
* Hyperty Group Chat Manager API (HypertyChat)
* @author Vitor Silva [vitor-t-silva@telecom.pt]
* @version 0.1.0
*/
class GroupChatManager {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    let syncher = new Syncher(hypertyURL, bus, configuration);

    let domain = divideURL(hypertyURL).domain;
    let discovery = new Discovery(hypertyURL, bus);
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/Communication';

    _this._hypertyURL = hypertyURL;
    _this._syncher = syncher;
    _this._domain = domain;

    _this.discovery = discovery;
    _this.identityManager = identityManager;

    _this.search = new Search(discovery, identityManager);

    _this.communicationObject = communicationObject;

    console.log('Discover: ', discovery);
    console.log('Identity Manager: ', identityManager);

    syncher.onNotification(function(event) {

      if (event.type === 'create') {

        // TODO: replace the 100 for Message.Response
        event.ack(100);

        if (_this._onInvitation) { _this._onInvitation(event); }
      }

      if (event.type === 'delete') {
        // TODO: replace the 200 for Message.Response
        event.ack(200);

        //Reset all the parameters
        _this.communicationObject.owner = '';
        _this.communicationObject.name = '';
        _this.communicationObject.id = '';
        _this.communicationObject.status = '';
        _this.communicationObject.startingTime = '';
        _this.communicationObject.lastModified = '';
        _this.communicationObject.participants = [];
        _this.communicationObject.resources = ['chat'];
        _this.communicationObject.children = [];

        if (_this.chatController) {
          _this.chatController.closeEvent(event);
        }
      }

    });

  }

  /**
   * This function is used to create a new Group Chat providing the name and the identifiers of users to be invited.
   * @param  {string}                     name  Is a string to identify the Group Chat
   * @param  {array<URL.userURL>}         users Array of users to be invited to join the Group Chat. Users are identified with reTHINK User URL, like this format user://<ipddomain>/<user-identifier>
   * @return {<Promise>ChatController}    A ChatController object as a Promise.
   */
  create(name, users, domains) {

    let _this = this;
    let syncher = _this._syncher;

    return new Promise(function(resolve, reject) {

      // Create owner participant
      _this.communicationObject.owner = _this._hypertyURL;
      _this.communicationObject.name = name;
      _this.communicationObject.id = name;
      _this.communicationObject.resources = ['chat'];
      _this.communicationObject.children = [];
      _this.communicationObject.status = CommunicationStatus.OPEN;
      _this.communicationObject.startingTime = new Date().toJSON();
      _this.communicationObject.lastModified = _this.communicationObject.startingTime;

      _this.search.myIdentity().then((identity) => {

        // Add my identity
        _this.communicationObject.participants.push(identity);

        console.info('searching ' + users + ' at domain ' + domains);

        let usersSearch = _this.search.users(users, domains, ['comm'], ['chat']);
        console.log('usersSearch->', usersSearch);
        return usersSearch;
      }).then((hypertiesIDs) => {
        console.log('hypertiesIDS',hypertiesIDs);

        let selectedHyperties = hypertiesIDs.map((hyperty) => {
          return hyperty.hypertyID;
        });

        console.info('------------------------ Syncher Create ---------------------- \n');
        console.info('Selected Hyperties: !!! ', selectedHyperties);
        console.info(`Have ${selectedHyperties.length} users;`);

        if(hypertiesIDs[0] && typeof(hypertiesIDs[0]) !== 'object' &&  hypertiesIDs[0].split('@').length > 1) {
          console.log('here');
          return syncher.create(_this._objectDescURL, hypertiesIDs, _this.communicationObject);
        } else {
          console.log('here2');
          return syncher.create(_this._objectDescURL, selectedHyperties, _this.communicationObject);
        }

      }).catch((reason) => {
        console.log('[GroupChatManager] MyIdentity Error:', reason);
        return reject(reason);
      }).then(function(dataObjectReporter) {
        console.info('3. Return Create Data Object Reporter', dataObjectReporter);

        let chatController = new ChatController(syncher, _this.discovery, _this._domain, _this.search);
        chatController.dataObjectReporter = dataObjectReporter;
        _this.chatController = chatController;
        resolve(chatController);

      }).catch(function(reason) {
        reject(reason);
      });
    });

  }

  /**
   * This function is used to handle notifications about incoming invitations to join a Group Chat.
   * @param  {Function} CreateEvent The CreateEvent fired by the Syncher when an invitaion is received
   */
  onInvitation(callback) {
    let _this = this;
    _this._onInvitation = callback;
  }

  /**
   * This function is used to join a Group Chat.
   * @param  {URL.CommunicationURL} invitationURL  The Communication URL of the Group Chat to join that is provided in the invitation event
   * @return {<Promise>ChatController}             It returns the ChatController object as a Promise
   */
  join(invitationURL) {
    let _this = this;
    let syncher = _this._syncher;

    return new Promise(function(resolve, reject) {

      console.info('------------------------ Syncher subscribe ---------------------- \n');
      console.info(invitationURL);

      syncher.subscribe(_this._objectDescURL, invitationURL).then(function(dataObjectObserver) {
        console.info('Data Object Observer: ', dataObjectObserver);
        let chatController = new ChatController(syncher, _this.discovery, _this._domain, _this.search);
        resolve(chatController);

        chatController.dataObjectObserver = dataObjectObserver;

      }).catch(function(reason) {
        reject(reason);
      });
    });

  }

}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'GroupChatManager',
    instance: new GroupChatManager(hypertyURL, bus, configuration)
  };

}
