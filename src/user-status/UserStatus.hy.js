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
import HypertyDiscovery from 'service-framework/dist/HypertyDiscovery';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import EventEmitter from '../utils/EventEmitter.js';
import {divideURL} from '../utils/utils.js';

let status = {
  name: 'status',
  status: 'disconnected'
};

/**
* Hyperty Presence;
* @author Apizee [dev@apizee.com]
* @version 0.1.0
*/
class UserStatus extends EventEmitter {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    super(hypertyURL, bus, configuration);

    let domain = divideURL(hypertyURL).domain;

    this._syncher = new Syncher(hypertyURL, bus, configuration);

    this._hypertyDiscovery = new HypertyDiscovery(hypertyURL, bus);

    this._objectDescURL = 'hyperty-catalogue://' + domain + '/.well-known/dataschemas/UserStatusDataSchema';

    this._hypertyURL = hypertyURL;
    this._domain = domain;

    this._heartbeat = [];

    this._syncher.onNotification((event) => {
      this._onNotification(event);
    });

  }

  _onNotification(event) {
    console.info('Event Received: ', event);

    this.trigger('invitation', event.identity);

    event.ack();

    // Subscribe Hello World Object
    this._syncher.subscribe(this._objectDescURL, event.url).then((statusObjectObserver) => {
      console.info('-------- Status Observer received ---------', statusObjectObserver);

      this.trigger('statusChange', {
        identity: event.identity,
        status: statusObjectObserver.data.status
      });

      this._managePresenceHeartbeat(event.identity);

      statusObjectObserver.onChange('*', () => {
        console.info('status event received:', event);
        this.trigger('statusChange', {
          identity: event.identity,
          status: statusObjectObserver.data.status
        });
        this._managePresenceHeartbeat(event.identity);
      });

      console.log(event.identity.email, 'has subscribe to my status data object, send invite to listen mine');
      this._statusObjectReporter.inviteObservers([event.from]);

    }).catch(function(reason) {
      console.error(reason);
    });
  }

  /**
   * This function is used to create a new status object syncher
   * @param  {URL.UserURL} participants List of User allowed
   * @return {Promise}
   */
  create(participants) {

    return new Promise((resolve, reject) => {

      status.status = 'connected';
      status.owner = this._hypertyURL;
      status.name = 'presence';

      console.info('----------------------- Mapping Particpants --------------------');
      this._mappingUser(participants)
      .then((hyperties) => this.createSyncher(hyperties, status))
      .then((statusObjectReporter) => {
        this._statusObjectReporter = statusObjectReporter;
        this._statusObjectReporter.onSubscription(function(event) {
          console.info('-------- Status Reporter received subscription request ---------', event);
          event.accept();
        });
        setInterval(() => {
          this._sendHeartbeat();
        }, 50000);
      }).catch(function(reason) {
        reject(reason);
      });

    });

  }

  createSyncher(hyperties, status) {
    console.info('------------------------ Syncher Create ----------------------', hyperties, status);
    return this._syncher.create(this._objectDescURL, hyperties, status);
  }

  join(resource) {
    return new Promise((resolve, reject) => {

      console.info('------------------------ Syncher subscribe ----------------------');

      this._syncher.subscribe(this._objectDescURL, resource).then(function(dataObjectObserver) {
        console.info('Data Object Observer: ', dataObjectObserver);

      }).catch(function(reason) {
        reject(reason);
      });
    });

  }

  setStatus(newStatus) {
    console.log('change status to', newStatus);
    this._statusObjectReporter.data.status = newStatus;
  }

  /**
   * Update status object date
   */
  _sendHeartbeat() {
    console.log('send heartbeat');
    this._statusObjectReporter.data.date = (new Date()).getTime();
  }

  /**
   * Monitor user activity within heartbeat timeout period
   */
  _managePresenceHeartbeat(identity) {
    console.log('renew heartbeat period for', identity);
    let email = identity.email;
    if (email in this._heartbeat) {
      clearTimeout(this._heartbeat[email]);
    }
    this._heartbeat[email] = setTimeout(() => {
      console.log(email, 'has disconnect');
      clearTimeout(this._heartbeat[email]);
      this.trigger('statusChange', {
        identity: identity,
        status: 'disconnected'
      });
    }, 60000);
  }

  _mappingUser(userList) {
    console.info('------------------------ _mappingUser ----------------------', userList);

    return new Promise((resolve, reject) => {
      let hyperties = [];
      let count = 0;

      if (userList.length === 0) reject(hyperties);

      let resultUsers = function() {
        if (count === userList.length) {
          console.info('Have ' + hyperties.length + 'users found;');
          resolve(hyperties);
        }
      };

      let activeUsers = function(user) {
        count++;
        hyperties.push(user.hypertyURL);
        resultUsers();
      };

      let inactiveUsers = function() {
        count++;
        resultUsers();
      };

      userList.forEach((user) => {
        console.log(user);
        if (user.email.length) {
          console.info('------------------------ _mappingUser ----------------------', userList);
          return this._hypertyDiscovery.discoverHypertyPerUser(user.email, user.domain).then(activeUsers).catch(inactiveUsers);
        }
      });

    });
  }

}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'UserStatus',
    instance: new UserStatus(hypertyURL, bus, configuration)
  };

}
