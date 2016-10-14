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
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import EventEmitter from '../utils/EventEmitter.js';
// import {divideURL} from '../utils/utils.js';
import URI from 'urijs';

import availability from './availability.js';

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

    this._syncher = new Syncher(hypertyURL, bus, configuration);

    this._discovery = new Discovery(hypertyURL, bus);

    this._userStatusDescURL = 'hyperty-catalogue://' + (new URI(hypertyURL)).hostname() + '/.well-known/dataschemas/Context';

    this._heartbeat = [];

    this._syncher.onNotification((event) => {
      this._onNotification(event);
    });
  }

  _onNotification(event) {
    console.info('UserStatus Event Received: ', event);
    console.log('from hyperty', event.from);

    event.ack();

    if (event.schema === this._userStatusDescURL) {
      // Subscribe to user status presence
      this._syncher.subscribe(this._userStatusDescURL, event.url).then((statusObjectObserver) => {
        console.info('-------- Status Observer received ---------', statusObjectObserver);
        console.log('trigger statusChange for', event.identity);
        this.trigger('statusChange', {
          identity: event.identity,
          status: this.getStatus(statusObjectObserver)
        });

        this._managePresenceHeartbeat(event.identity);

        statusObjectObserver.onChange('*', () => {
          console.info('status event received:', event);
          this.trigger('statusChange', {
            identity: event.identity,
            status: this.getStatus(statusObjectObserver)
          });
          this._managePresenceHeartbeat(event.identity);
        });

        console.log(event.identity.email, 'has subscribe to my status data object, send invite to listen mine');
        this._statusObjectReporter.inviteObservers([event.from]);

      }).catch(function(reason) {
        console.error(reason);
      });
    }
  }

  /**
   * This function is used to create a new status object syncher
   * @param  {URL.UserURL} participants List of User allowed
   * @return {Promise}
   */
  create(participants) {

    return new Promise((resolve, reject) => {
      console.info('----------------------- Mapping Particpants --------------------');
      this._mappingUser(participants)
      .then((hyperties) => this.createSyncher(hyperties, availability()))
      .then((statusObjectReporter) => {
        this._statusObjectReporter = statusObjectReporter;

        this._statusObjectReporter.onSubscription((event) => {
          console.info('-------- Status Reporter received subscription request ---------', event);
          event.accept();
          if (event.url === this._statusObjectReporter._owner) {
              console.log('define my own presence state to available');
            this.setStatus('available');
          }
        });

        // set interval for heartbeat
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
    return this._syncher.create(this._userStatusDescURL, hyperties, status);
  }

  join(resource) {
    return new Promise((resolve, reject) => {

      console.info('------------------------ Syncher subscribe ----------------------');

      this._syncher.subscribe(this._userStatusDescURL, resource).then(function(dataObjectObserver) {
        console.info('Data Object Observer: ', dataObjectObserver);

      }).catch(function(reason) {
        reject(reason);
      });
    });
  }

  getStatus(statusObserver) {
      let state = false;
      if (typeof statusObserver !== 'undefined') {
        console.log('getStatus from observer:', statusObserver.data.values[0].value);
        return statusObserver.data.values[0].value;
      } else {
        console.log('getStatus from reporter:', this._statusObjectReporter.data.values[0].value);
        return this._statusObjectReporter.data.values[0].value;
      }
      return state;

  }

  setStatus(newStatus) {
    console.log('setStatus', newStatus, 'in reporter', this._statusObjectReporter.data);
    this._statusObjectReporter.data.values[0].value = newStatus;
    this._statusObjectReporter.data.time = (new Date()).getTime();
  }

  /**
   * Update status object date
   */
  _sendHeartbeat() {
    console.log('send heartbeat');
    this._statusObjectReporter.data.time = (new Date()).getTime();
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
        status: 'unavailable'
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
          return this._discovery.discoverHypertyPerUser(user.email, user.domain).then(activeUsers).catch(inactiveUsers);
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
