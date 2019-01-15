
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
import { hypertyDescriptor } from './HypertyDescriptor';

/**
* Hyperty Group Chat Manager API (HypertyChat)
* @author Vitor Silva [vitor-t-silva@telecom.pt]
* @version 0.1.0
*/
class SimpleChat {

  constructor() {}

  get name(){
    return hypertyDescriptor.name;
  }

  get descriptor() {
    return hypertyDescriptor;
  }

  get runtimeHypertyURL(){
    return this._myUrl;
  }

    _start(hypertyURL, bus, configuration, factory) {
      //    super(hypertyURL, bus, configuration, factory);

    let _this = this;
    _this._factory = factory;
    _this._syncher = factory.createSyncher(hypertyURL, bus, configuration);

//    _this._manager = factory.createSimpleChatManager(hypertyURL, bus, configuration, _this._syncher);
    _this._manager = factory.createSimpleChatManager(hypertyURL, bus, configuration, _this._syncher);
    _this.discovery = _this._manager.discovery;
    _this.identityManager = _this._manager.identityManager;
//    _this.search = _this._manager.search;
    _this._domain = _this._manager._domain;
    _this._myUrl = hypertyURL;
    _this.hypertyURL = hypertyURL;
    _this._runtimeURL = configuration.runtimeURL;
    _this._bus = bus;

    _this._syncher.onNotification(function (event) {
      console.log('[SimpleChat] onNotification:', event);
      _this.processNotification(event);
    });

    _this._resumeReporters();
    _this._resumeObservers();

    console.log('[SimpleChat] configuration ', configuration);

    _this._manager.offline = configuration.offline ? configuration.offline : false;

    _this._manager.backup = configuration.backup ? configuration.backup : false;

  }


  /**
   * Register as agent.
   */
  register(CRMaddress, code) {
    let _this = this;
    _this._manager.identityManager.discoverUserRegistered().then((identity) => {
      const msgIdentity = { userProfile: { guid: identity.guid, userURL: identity.userURL, info: { code: code } } };
      let createMessage = {
        type: 'forward', to: CRMaddress, from: _this.hypertyURL,
        identity: msgIdentity,
        body: {
          type: 'create',
          from: _this.hypertyURL,
          identity: msgIdentity
        }
      };
      _this._bus.postMessage(createMessage);
    }).catch((error) => {
      console.error('[SimpleChat] ERROR:', error);
      reject(error);
    });

  }



  /**
   * Add participant to ticket.
   */
  newParticipant(CRMaddress, participantHypertyURL, objectUrl) {

    let _this = this;
    _this._manager.identityManager.discoverUserRegistered().then((identity) => {
      console.log('[SimpleChat] GET MY IDENTITY:', identity);
      let newParticipantMessage = {
        type: 'forward',
        to: `${CRMaddress}/tickets`,
        from: objectUrl,
        identity: identity,
        body: {
          type: "update",
          from: objectUrl,
          identity: identity,
          status: "new-participant",
          participant: participantHypertyURL
        }
      };
      _this._bus.postMessage(newParticipantMessage);
    }).catch((error) => {
      console.error('[SimpleChat] ERROR:', error);
      reject(error);
    });

  }

  /**
  * Close ticket
  */
  closeTicket(CRMaddress, participantHypertyURL, objectUrl) {

    let _this = this;
    _this._manager.identityManager.discoverUserRegistered().then((identity) => {
      let newParticipantMessage = {
        type: 'forward',
        to: `${CRMaddress}/tickets`,
        from: objectUrl,
        identity: identity,
        body: {
          type: "update",
          from: objectUrl,
          identity: identity,
          status: "closed",
          participant: participantHypertyURL
        }
      };
      _this._bus.postMessage(newParticipantMessage);
    }).catch((error) => {
      console.error('[SimpleChat] ERROR:', error);
      reject(error);
    });

  }

  _getRegisteredUser() {
    let _this = this;

    return new Promise((resolve, reject) => {

      if (_this._manager.currentIdentity) {
        resolve(_this._manager.currentIdentity);
      } else {
        // create a new chatController but first get identity
        _this._manager.identityManager.discoverUserRegistered().then((identity) => {
          console.log('[SimpleChat] GET MY IDENTITY:', identity);
          resolve(identity);
        }).catch((error) => {
          console.error('[SimpleChat] ERROR:', error);
          reject(error);
        });

      }

    });

  }


  _resumeReporters() {
    let _this = this;

    _this._syncher.resumeReporters({ store: true }).then((reporters) => {

      let reportersList = Object.keys(reporters);

      if (reportersList.length > 0) {

        _this._getRegisteredUser().then((identity) => {

          reportersList.forEach((dataObjectReporterURL) => {

            console.log('[SimpleChat.resumeReporter]: ', dataObjectReporterURL);

            let chatController = _this._factory.createChat(_this._syncher, _this._domain, identity, _this._manager);
            chatController.dataObjectReporter = reporters[dataObjectReporterURL];

            // Save the chat controllers by dataObjectReporterURL
            this._manager._reportersControllers[dataObjectReporterURL] = chatController;

            _this._resumeInterworking(chatController.dataObjectReporter);

            console.log('[SimpleChat] chatController invitationsHandler: ', chatController.invitationsHandler);

//            chatController.invitationsHandler.resumeDiscoveries(_this._manager.discovery, chatController.dataObjectReporter);

          });

          if (_this._onResumeReporter) _this._onResumeReporter(this._manager._reportersControllers);

        });

      }

    }).catch((reason) => {
      console.info('[SimpleChat.resumeReporters] :', reason);
    });

  }

  _resumeObservers() {
    let _this = this;

    _this._syncher.resumeObservers({ store: true }).then((observers) => {

      console.log('[SimpleChat] resuming observers : ', observers, _this, _this._onResume);

      let observersList = Object.keys(observers);
      if (observersList.length > 0) {

        _this._getRegisteredUser().then((identity) => {

          observersList.forEach((dataObjectObserverURL) => {

            console.log('[SimpleChat].syncher.resumeObserver: ', dataObjectObserverURL);

            let chatObserver = observers[dataObjectObserverURL];

//            let chatController = _this._factory.createChatController(_this._syncher, _this._manager.discovery, _this._domain, _this.search, identity, _this._manager);
            let chatController = _this._factory.createChat(_this._syncher, _this._domain, identity, _this._manager);
            chatController.dataObjectObserver = chatObserver;

            // Save the chat controllers by dataObjectReporterURL
            this._manager._observersControllers[dataObjectObserverURL] = chatController;

//            let reporterStatus = _this._factory.createRegistrationStatus(chatObserver.url, _this._runtimeURL, _this._myUrl, _this._bus);

            // recursive function to sync with chat reporter

/*            let reporterSync = function (observer, subscriber, status) {
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

            reporterSync(chatObserver, _this._myUrl, reporterStatus);*/

          });

          if (_this._onResumeObserver) _this._onResumeObserver(this._manager._observersControllers);

        });

      }

    }).catch((reason) => {
      console.info('[SimpleChat] Resume Observer | ', reason);
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

      console.log('[SimpleChat._resumeInterworking for] ', participants);

      Object.keys(participants).forEach((participant) => {

        let user = participants[participant].identity.userProfile.userURL.split('://');

        if (user[0] !== 'user') {

          console.log('[SimpleChat._resumeInterworking for] ', participant);

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
   * @param  {array<URL.HypertyURL>}         users Array of users to be invited to join the Group Chat. Users are identified with reTHINK User URL, like this format user://<ipddomain>/<user-identifier>
   * @return {<Promise>ChatController}    A ChatController object as a Promise.
   */
  create(name, hyperties, extra = {mutual: false, domain_registration: false, reuseURL: true }) {
//  create(name, hyperties, extra = {mutual: false, reuseURL: true }) {
      return this._manager.create(name, hyperties, extra);
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
    return this._manager.join(invitationURL, false);


  }
  /**
   * This function is used to retrieve my identity.
   * @return {<Promise>Identity}             It returns the Identity object as a Promise
   */
  myIdentity(identity) {
    console.log('[SimpleChat.myIdentity] ', identity);
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

export default SimpleChat;
