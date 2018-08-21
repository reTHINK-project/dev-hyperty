
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
//import IdentityManager from 'service-framework/dist/IdentityManager';
//import {ChatManager,ChatController} from 'runtime-core/dist/ChatManager';
//import { RegistrationStatus} from 'service-framework/dist/Discovery';
//import {Syncher} from 'service-framework/dist/Syncher';

// Utils
/*import {divideURL} from '../utils/utils';
import Search from '../utils/Search';*/

// Internals
/*import { communicationObject, CommunicationStatus, communicationChildren } from './communication';
import { UserInfo } from './UserInfo';*/

/**
* Hyperty Group Chat Manager API (HypertyChat)
* @author Vitor Silva [vitor-t-silva@telecom.pt]
* @version 0.1.0
*/
class GroupChatManager {

  constructor(hypertyURL, bus, configuration, factory) {
//    super(hypertyURL, bus, configuration, factory);

    let _this = this;
    _this._factory = factory;
    _this._syncher = factory.createSyncher(hypertyURL, bus, configuration);

    _this._manager = factory.createChatManager(hypertyURL, bus, configuration, _this._syncher);
    _this.discovery = _this._manager.discovery;
    _this.identityManager = _this._manager.identityManager;
    _this.search = _this._manager.search;
    _this._domain = _this._manager._domain;
    _this._myUrl = hypertyURL;
    _this._runtimeURL = configuration.runtimeURL;

    _this._syncher.onNotification(function(event) {
      console.log('[GroupChatManager] onNotification:', event);
      _this.processNotification(event);
    });

    _this._resumeReporters();
    _this._resumeObservers();



  }

  _getRegisteredUser() {
    let _this = this;

    return new Promise((resolve, reject) => {

      if (_this._manager.currentIdentity) {
        resolve(_this._manager.currentIdentity);
      } else {
        // create a new chatController but first get identity
        _this._manager.identityManager.discoverUserRegistered().then((identity) => {
          console.log('[GroupChatManager] GET MY IDENTITY:', identity);
          resolve(identity);
        }).catch((error) => {
          console.error('[GroupChatManager] ERROR:', error);
          reject(error);
        });

      }

    });

  }


  _resumeReporters() {
    let _this = this;

    _this._syncher.resumeReporters({store: true}).then((reporters) => {

      let reportersList = Object.keys(reporters);

      if (reportersList.length  > 0) {

        _this._getRegisteredUser().then((identity) => {

          reportersList.forEach((dataObjectReporterURL) => {

            console.log('[GroupChatManager.resumeReporter]: ', dataObjectReporterURL);

            let chatController = _this._factory.createChatController(_this._syncher, _this.discovery, _this._domain, _this.search, identity, _this._manager);
            chatController.dataObjectReporter = reporters[dataObjectReporterURL];

            // Save the chat controllers by dataObjectReporterURL
            this._manager._reportersControllers[dataObjectReporterURL] = chatController;

            _this._resumeInterworking(chatController.dataObjectReporter);

            console.log('[GroupChatManager] chatController invitationsHandler: ',   chatController.invitationsHandler);

            chatController.invitationsHandler.resumeDiscoveries(_this._manager.discovery, chatController.dataObjectReporter);

          });

          if (_this._onResumeReporter) _this._onResumeReporter(this._manager._reportersControllers);

        });

      }

    }).catch((reason) => {
      console.info('[GroupChatManager.resumeReporters] :', reason);
    });

  }

  _resumeObservers() {
    let _this = this;

    _this._syncher.resumeObservers({store: true}).then((observers) => {

      console.log('[GroupChatManager] resuming observers : ', observers, _this, _this._onResume);

      let observersList = Object.keys(observers);
      if (observersList.length  > 0) {

        _this._getRegisteredUser().then((identity) => {

          observersList.forEach((dataObjectObserverURL) => {

            console.log('[GroupChatManager].syncher.resumeObserver: ', dataObjectObserverURL);

            let chatObserver = observers[dataObjectObserverURL];

            let chatController = _this._factory.createChatController(_this._syncher, _this._manager.discovery, _this._domain, _this.search, identity, _this._manager);
            chatController.dataObjectObserver = chatObserver;

            // Save the chat controllers by dataObjectReporterURL
            this._manager._observersControllers[dataObjectObserverURL] = chatController;

            let reporterStatus = _this._factory.createRegistrationStatus(chatObserver.url, _this._runtimeURL, _this._myUrl, _this._bus);

            // recursive function to sync with chat reporter

            let reporterSync = function(observer, subscriber, status) {
              let statusOfReporter = status;
              observer.sync().then((synched) => {

                if (!synched) {

                  statusOfReporter.onLive(subscriber, () => {
                    statusOfReporter.unsubscribeLive(subscriber);
                    reporterSync(observer, subscriber, statusOfReporter);
                  });

                  //TODO: subscribe to sync when reporter is live. New synched messages should trigger onMessage ie onChild
                }
              });
            };

            reporterSync(chatObserver, _this._myUrl, reporterStatus);

          });

          if (_this._onResumeObserver) _this._onResumeObserver(this._manager._observersControllers);

        });

      }

    }).catch((reason) => {
      console.info('[GroupChatManager] Resume Observer | ', reason);
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

      // let name = communication.name;

      console.log('[GroupChatManager._resumeInterworking for] ', participants);

      Object.keys(participants).forEach((participant) => {

        let user = participants[participant].identity.userProfile.userURL.split('://');

        if (user[0] !== 'user') {

          console.log('[GroupChatManager._resumeInterworking for] ', participant);

          user = user[0] + '://' + user[1].split('/')[1];

          let msg = {
            type: 'create', from: _this._myUrl, to: user,
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
    return this._manager.create(name, users, extra);



  }


  /**
   * This function is used to handle notifications about incoming invitations to join a Group Chat.
   * @param  {Function} CreateEvent The CreateEvent fired by the Syncher when an invitaion is received
   */
  onInvitation(callback) {
    return this._manager.onInvitation(callback);
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
    return this._manager.join(invitationURL);


  }
  /**
   * This function is used to retrieve my identity.
   * @return {<Promise>Identity}             It returns the Identity object as a Promise
   */
  myIdentity(identity) {
    console.log('[GroupChatManager.myIdentity] ', identity);
    return this._manager.myIdentity(identity);


  }
  /**
   * This function is used to process incoming messages.
   */
  processNotification(event) {
    return this._manager.processNotification(event);


  }

  /**
   * This function is used to process incoming messages.
   */
  onInvitation(callback) {
    return this._manager.onInvitation(callback);


  }

}

export default function activate(hypertyURL, bus, configuration, factory) {

  return {
    name: 'GroupChatManager',
    instance: new GroupChatManager(hypertyURL, bus, configuration, factory)
  };

}
