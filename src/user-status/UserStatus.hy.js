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
import {divideURL} from '../utils/utils.js';
import URI from 'urijs';

import availability from './availability.js';
let statusHyperty = [];

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

    this.syncher = new Syncher(hypertyURL, bus, configuration);

    this.discovery = new Discovery(hypertyURL, bus);
    this.domain = divideURL(hypertyURL).domain;

    this.userStatusDescURL = 'hyperty-catalogue://catalogue.' + this.domain + '/.well-known/dataschema/Context';

    this.heartbeat = [];

    this.syncher.onNotification((event) => {
      let _this = this;
      _this.onNotification(event);
    });
  }

  onNotification(event) {
    let _this = this;
    console.info('UserStatus Event Received: ', event);
    console.log('from hyperty', event.from);

    event.ack();

    // if (event.schema === _this.userStatusDescURL) {
      // Subscribe to user status presence
      _this.syncher.subscribe(_this.userStatusDescURL, event.url).then((statusObjectObserver) => {
        console.info('-------- Status Observer received ---------', statusObjectObserver);
        console.log('trigger statusChange for', event.identity);
        _this.trigger('statusChange', {
          identity: event.identity,
          status: _this.getStatus(statusObjectObserver)
        });

        _this.managePresenceHeartbeat(event.identity);

        statusObjectObserver.onChange('*', () => {
          console.info('status event received:', event);
          _this.trigger('statusChange', {
            identity: event.identity,
            status: _this.getStatus(statusObjectObserver)
          });
          _this.managePresenceHeartbeat(event.identity);
        });

        console.log(event.identity.email, 'has subscribe to my status data object, send invite to listen mine');
        _this.statusObjectReporter.inviteObservers([event.from]);

      }).catch(function(reason) {
        console.error(reason);
      });
    // }
  }

  /**
   * This function is used to create a new status object syncher
   * @param  {URL.UserURL} participants List of User allowed
   * @return {Promise}
   */
  create(participants) {
    let _this = this;

    return new Promise((resolve, reject) => {
      console.info('----------------------- Mapping Particpants --------------------');
      _this.mappingUser(participants)
      .then((hyperties) => _this.createSyncher(hyperties, availability()))
      .then((statusObjectReporter) => {
        _this.statusObjectReporter = statusObjectReporter;

        _this.statusObjectReporter.onSubscription((event) => {
          console.info('-------- Status Reporter received subscription request ---------', event);
          event.accept();
          if (event.url === _this.statusObjectReporter.owner) {
              console.log('define my own presence state to available');
            _this.setStatus('available');
          }
        });

        // set interval for heartbeat
        setInterval(() => {
          _this.sendHeartbeat();
        }, 50000);
      }).catch(function(reason) {
        reject(reason);
      });

    });

  }

  createSyncher(hyperties, status) {
    let _this = this;
    console.info('------------------------ Syncher Create ----------------------', hyperties, status);
    return _this.syncher.create(_this.userStatusDescURL, hyperties, status);
  }
   
  onInvitation(callback) {
    let _this = this;
    _this.onInvitation = callback;
  }

  join(invitationURL) {
      let _this = this;
      let syncher = _this.syncher;
    return new Promise((resolve, reject) => {

      console.info('------------------------ Syncher subscribe ---------------------- \n');

      syncher.subscribe(_this.userStatusDescURL, invitationURL, true, false).then(function(dataObjectObserver) {
        console.info('Data Object Observer: ', dataObjectObserver);
        resolve();
      }).catch(function(reason) {
        reject(reason);
      });
    });
  }

  getStatus(statusObserver) {
    let _this = this;
      let state = false;
      if (typeof statusObserver !== 'undefined') {
        console.log('getStatus from observer:', statusObserver.data.values[0].value);
        return statusObserver.data.values[0].value;
      } else {
        console.log('getStatus from reporter:', _this.statusObjectReporter.data.values[0].value);
        return _this.statusObjectReporter.data.values[0].value;
      }
      return state;

  }


  setStatus(newStatus) {
    let _this = this;
    console.log('setStatus', newStatus, 'in reporter', _this.statusObjectReporter.data);
    _this.statusObjectReporter.data.values[0].value = newStatus;
    console.debug('this._statusObjectReporter.data :', _this.statusObjectReporter.data);
    _this.statusObjectReporter.data.time = (new Date()).getTime();
  }

  /**
   * Update status object date
   */
  sendHeartbeat() {
    let _this = this;
    console.log('send heartbeat');
    _this.statusObjectReporter.data.time = (new Date()).getTime();
  }

  /**
   * Monitor user activity within heartbeat timeout period
   */
  managePresenceHeartbeat(identity) {
    let _this = this;
    console.log('renew heartbeat period for', identity);
    let email = identity.email;
    if (email in _this.heartbeat) {
      clearTimeout(_this.heartbeat[email]);
    }
    _this.heartbeat[email] = setTimeout(() => {
      console.log(email, 'has disconnect');
      clearTimeout(_this.heartbeat[email]);
      _this.trigger('statusChange', {
        identity: identity,
        status: 'unavailable'
      });
    }, 60000);
  }

  getLatestHypertyPerUser(hypertyObj) {

        let hyperty;
        let mostRecent;
        let lastHyperty;

        new Promise(function(resolve, reject) {
       
          for (var i = 0; i < hypertyObj.length; i++) {

          if (hypertyObj[i].lastModified !== undefined) {
            if (mostRecent === undefined) {
              mostRecent = new Date(hypertyObj[i].lastModified);
              lastHyperty = hypertyObj[i];
            } else {
              let hypertyDate = new Date(hypertyObj[i].lastModified);
              if (mostRecent.getTime() < hypertyDate.getTime()) {
                mostRecent = hypertyDate;
                lastHyperty = hypertyObj[i];
              }
            }
          }
        }

        console.log('Last Hyperty: ', lastHyperty, mostRecent);       
        resolve(lastHyperty);
   
    }).catch((reason) => {
      console.error('Error Happened while geting Lateast Hyperty per user reason:', reason);
        reject();
    });
    return lastHyperty;
  }

  mappingUser(userList) {
    let _this = this;
    console.info('------------------------ mappingUser ----------------------', userList);

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
        console.debug('user , hyperties ', user, hyperties )
        hyperties.push(user.hypertyURL);
        resultUsers();
      };

      let inactiveUsers = function() {
        count++;
        resultUsers();
      };

      userList.forEach((user) => {
        console.log('user :', user);
        if (user.email.length) {
          console.info('------------------------ mappingUser ----------------------', userList);
          return _this.discovery.discoverHypertiesPerUser(user.email, user.domain).then((activeUsers) => {

           console.debug('discovered activeUsers are :', activeUsers);
           let size = Object.keys(activeUsers).length;
           for ( let i = 0; i <  size; i++) {
             console.debug('activeUsers[Object.keys(activeUsers)[i]]----------', activeUsers[Object.keys(activeUsers)[i]]);
              if(activeUsers[Object.keys(activeUsers)[i]].descriptor.substr(activeUsers[Object.keys(activeUsers)[i]].descriptor.lastIndexOf('/') + 1) === "UserStatus") {
              statusHyperty.push(activeUsers[Object.keys(activeUsers)[i]]);
            }
          }
          let foundstatus = _this.getLatestHypertyPerUser(statusHyperty);
          console.debug('activeUsers:', foundstatus)
          count++;
          hyperties.push(foundstatus.hypertyID);
           console.debug('user , hyperties ', user , hyperties)
           if (count === userList.length) {
              console.info('Have ' + hyperties.length + 'users found;');
              resolve(hyperties);
            }

          }).catch(inactiveUsers);
        }
      });

      // userList.forEach((user) => {
      //   console.log(user);
      //   if (user.email.length) {
      //     console.info('------------------------ mappingUser ----------------------', userList);
      //     return _this.discovery.discoverHypertyPerUser(user.email, user.domain).then(activeUsers).catch(inactiveUsers);
      //   }
      // });

    });
  }

}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'UserStatus',
    instance: new UserStatus(hypertyURL, bus, configuration)
  };

}
