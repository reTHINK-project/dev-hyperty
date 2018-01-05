
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
import {Discovery, RegistrationStatus} from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import {divideURL} from '../utils/utils';
import Search from '../utils/Search';

// Internals
import { communicationObject, CommunicationStatus, communicationChildren } from './communication';
import ChatController from './ChatController';
import InvitationsHandler from './InvitationsHandler';
import { UserInfo } from './UserInfo';

/**
* Hyperty Group Chat Manager API (HypertyChat)
* @author Vitor Silva [vitor-t-silva@telecom.pt]
* @version 0.1.0
*/
class GroupChatManager {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('[GroupChatManager.constructor] The hypertyURL is a needed parameter');
    if (!bus) throw new Error('[GroupChatManager.constructor] The MiniBus is a needed parameter');
    if (!configuration) throw new Error('[GroupChatManager.constructor] The configuration is a needed parameter');

    let _this = this;
    let syncher = new Syncher(hypertyURL, bus, configuration);


    let domain = divideURL(hypertyURL).domain;
    let discovery = new Discovery(hypertyURL, configuration.runtimeURL, bus);
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/Communication';

    _this._reportersControllers = {};
    _this._observersControllers = {};

    _this._hypertyURL = hypertyURL;
    _this._bus = bus;
    _this._runtimeURL = configuration.runtimeURL;
    _this._syncher = syncher;
    _this._domain = domain;

    _this.discovery = discovery;
    _this.identityManager = identityManager;

    _this.search = new Search(discovery, identityManager);

    _this._invitationsHandler = new InvitationsHandler(hypertyURL);

    _this.communicationObject = communicationObject;

    _this.communicationChildren = communicationChildren;

    console.log('[GroupChatManager] Discover ', discovery);
    console.log('[GroupChatManager] Identity Manager ', identityManager);

    syncher.resumeReporters({store: true}).then((reporters) => {

      let reportersList = Object.keys(reporters);

      if (reportersList.length  > 0) {

      Object.keys(reporters).forEach((dataObjectReporterURL) => {
        console.log('[GroupChatManager.resumeReporters]: ', dataObjectReporterURL);
        // create a new chatController but first get identity
        _this.search.myIdentity().then((identity) => {

          let chatController = new ChatController(syncher, _this.discovery, _this._domain, _this.search, identity, _this, _this._invitationsHandler);
          chatController.dataObjectReporter = reporters[dataObjectReporterURL];

          // Save the chat controllers by dataObjectReporterURL
          this._reportersControllers[dataObjectReporterURL] = chatController;

          _this._resumeInterworking(chatController.dataObjectReporter);

          if (_this._onResumeReporter) _this._onResumeReporter(this._reportersControllers);

          _this._invitationsHandler.resumeDiscoveries(_this.discovery, chatController.dataObjectReporter);
        });
      });
    }

    }).catch((reason) => {
      console.info('[GroupChatManager.resumeReporters] :', reason);
    });

    syncher.resumeObservers({store: true}).then((observers) => {
      console.log('[GroupChatManager] resuming observers : ', observers, _this, _this._onResume);

      let observersList = Object.keys(observers);
      if (observersList.length  > 0) {
        observersList.forEach((dataObjectObserverURL) => {

        console.log('[GroupChatManager].syncher.resumeObservers ', dataObjectObserverURL);
        // create a new chatController but first get indentity
        this.search.myIdentity().then((identity) => {

          let chatObserver = observers[dataObjectObserverURL];

          let chatController = new ChatController(syncher, _this.discovery, _this._domain, _this.search, identity, _this, _this._invitationsHandler);
          chatController.dataObjectObserver = chatObserver;

          // Save the chat controllers by dataObjectReporterURL
          this._observersControllers[dataObjectObserverURL] = chatController;
          if (_this._onResumeObserver) _this._onResumeObserver(this._observersControllers);

          let reporterStatus = new RegistrationStatus(chatObserver.url, _this._runtimeURL, _this._hypertyURL, _this._bus );

          // recursive function to sync with chat reporter

          let reporterSync = function(observer, subscriber, status) {
            let statusOfReporter = status;
            observer.sync().then((synched) => {

              if (!synched) {

                statusOfReporter.onLive( subscriber, () => {
                  statusOfReporter.unsubscribeLive(subscriber);
                  reporterSync(observer, subscriber, statusOfReporter);
                });
                //TODO: subscribe to sync when reporter is live. New synched messages should trigger onMessage ie onChild
              }
            });
          }

          reporterSync(chatObserver, _this._hypertyURL, reporterStatus);

        });
      });
      }
    }).catch((reason) => {
      console.info('[GroupChatManager] Resume Observer | ', reason);
    });

    syncher.onNotification(function(event) {

      console.log("[GroupChatManager] onNotification: ", event);

      if (event.type === 'create') {

        // TODO: replace the 100 for Message.Response
        event.ack(200);

        if (_this._onInvitation) { _this._onInvitation(event); }
      }

      if (event.type === 'delete') {
        // TODO: replace the 200 for Message.Response
        event.ack(200);

        _this._observersControllers[event.url].closeEvent = event;

        delete _this._observersControllers[event.url];

        _this._observersControllers.closeEvent = event;

        _this.communicationObject = communicationObject;



        for (let url in this._reportersControllers) {
          this._reportersControllers[url].closeEvent(event);
        }

        for (let url in this._observersControllers) {
          this._observersControllers[url].closeEvent(event);
        }

      }

    });

  }


  /**
   * This function is used to resume interworking Stubs for participants from legacy chat services
   * @param  {Communication}              communication Communication data object
   */

  _resumeInterworking(communication) {

    let _this = this;

    if (communication.data.participants) {

      let participants = communication.data.participants;
      let objectUrl = communication.url;
      let schemaUrl = communication.schema;
      let name = communication.name;

      console.log('[GroupChatManager._resumeInterworking for] ', participants);

      Object.keys(participants).forEach((participant) => {

        let user = participants[participant].identity.userProfile.userURL.split('://');

        if (user[0] !== 'user') {

          console.log('[GroupChatManager._resumeInterworking for] ', participant);

          user = user[0] + '://' + user[1].split('/')[1];

          let msg = {
              type: 'create', from: _this._hypertyURL, to: user,
              body: { resource: objectUrl, schema: schemaUrl, value: communication.metadata }
            };

          _this._bus.postMessage(msg, () => {
          });
        }

      });
    }
  }

  /**
   * This function is used to create a new Group Chat providing the name and the identifiers of users to be invited.
   * @param  {string}                     name  Is a string to identify the Group Chat
   * @param  {array<URL.userURL>}         users Array of users to be invited to join the Group Chat. Users are identified with reTHINK User URL, like this format user://<ipddomain>/<user-identifier>
   * @return {<Promise>ChatController}    A ChatController object as a Promise.
   */
  create(name, users, extra = {}) {

    let _this = this;
    let syncher = _this._syncher;

    return new Promise((resolve, reject) => {

      _this.communicationObject = communicationObject;
      _this.communicationObject.cseq = 1;
      _this.communicationObject.startingTime = new Date().toJSON();
      _this.communicationObject.status =  CommunicationStatus.OPEN;

      let myIdentity;

      _this.search.myIdentity().then((identity) => {
        myIdentity = identity;
        console.log('[GroupChatManager.create ] My Identity', identity);
        let url = _this.communicationObject.reporter;

        let userInfo = new UserInfo(_this._hypertyURL, _this._domain, identity);

        // Add my identity
        _this.communicationObject.participants[identity.userURL] = userInfo;

        console.log('[GroupChatManager.create ] participants: ', _this.communicationObject.participants);
        console.log('[GroupChatManager.create ] communicationObject', _this.communicationObject);
        console.info('[GroupChatManager.create] searching ' + users );

        //let usersSearch = _this.search.users(users, domains, ['comm'], ['chat']);

        let usersDiscovery = [];

        let disconnected = [];
        let live = {};
        let mutual = true;

        users.forEach((user) => {
          let userDiscoveryPromise = _this.discovery.discoverHypertiesDO(user.user, ['comm'], ['chat'], user.domain);
            usersDiscovery.push(userDiscoveryPromise);
            //if (user.user.includes('://')) mutual = false;
          });

        Promise.all(usersDiscovery).then((userDiscoveryResults) => {
          console.log('[GroupChatManager.create] Users Discovery Results->', userDiscoveryResults);

          let selectedHyperties = [];

           userDiscoveryResults.forEach((userDiscoveryResult) => {

             userDiscoveryResult.forEach((discovered)=>{
               if (discovered.data.status === 'live') {
                 selectedHyperties.push(discovered.data.hypertyID);
                 live[discovered.data.hypertyID] = discovered;
               } else disconnected.push(discovered);
             });

          });


/*        return usersSearch;
      }).then((hypertiesIDs) => {
        let selectedHyperties = hypertiesIDs.map((hyperty) => {
          return hyperty.hypertyID;
        }); */

          console.info('[GroupChatManager] ---------------------- Syncher Create ---------------------- \n');
          console.info('[GroupChatManager] Selected Hyperties: !!! ', selectedHyperties);
          console.info(`Have ${selectedHyperties.length} users;`);

          let input = Object.assign({resources: ['chat'], mutual: mutual}, extra);
          delete input.name;

          console.info('[GroupChatManager] input data:', input);
          return syncher.create(_this._objectDescURL, selectedHyperties, _this.communicationObject, true, false, name, {}, input);
        }).then(function(dataObjectReporter) {

          console.info('[GroupChatManager] 3. Return Create Data Object Reporter', dataObjectReporter);

          let chatController = new ChatController(syncher, _this.discovery, _this._domain, _this.search, myIdentity, _this, _this._invitationsHandler);
          chatController.dataObjectReporter = dataObjectReporter;
          resolve(chatController);

          _this._reportersControllers[dataObjectReporter.url] = chatController;

          // process invitations to handle not received invitations
          if (dataObjectReporter.invitations.length > 0) {
            _this._invitationsHandler.processInvitations(live, dataObjectReporter);
          }

          // If any invited User is disconnected let's wait until it is connected again
          if (disconnected.length > 0) _this._invitationsHandler.inviteDisconnectedHyperties(disconnected, dataObjectReporter);

        }).catch(function(reason) {
          reject(reason);
        });

      }).catch((reason) => {
        console.log('[GroupChatManager] MyIdentity Error:', reason);
        return reject(reason);
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

  onResumeReporter(callback) {
    let _this = this;
    _this._onResumeReporter = callback;
  }

  onResumeObserver(callback) {
    let _this = this;
    _this._onResumeObserver = callback;
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
      let myIdentity;
      console.info('[GroupChatManager] ------------------------ Syncher subscribe ---------------------- \n');
      console.info('invitationURL', invitationURL);
      _this.search.myIdentity().then((identity) => {
          myIdentity = identity;
          return syncher.subscribe(_this._objectDescURL, invitationURL, true, false);

      }).then(function(dataObjectObserver) {
        console.info('Data Object Observer: ', dataObjectObserver);

        let chatController = new ChatController(syncher, _this.discovery, _this._domain, _this.search, myIdentity, _this, _this._invitationsHandler);
        resolve(chatController);

        chatController.dataObjectObserver = dataObjectObserver;

        _this._observersControllers[dataObjectObserver.url] = chatController;

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
