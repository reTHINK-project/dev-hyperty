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
import IdentityManager from 'service-framework/dist/IdentityManager';
import {Syncher} from 'service-framework/dist/Syncher';

// Utils
import EventEmitter from '../utils/EventEmitter.js';
import {divideURL} from '../utils/utils.js';
import URI from 'urijs';

import availability from './availability.js';

/**
* Hyperty Presence;
* @author Apizee [dev@apizee.com]
* @version 0.1.0
*/
class UserAvailabilityReporter extends EventEmitter {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    super(hypertyURL, bus, configuration);
    let _this = this;

    console.info('[UserAvailabilityReporter] started with url: ', hypertyURL);

    this.syncher = new Syncher(hypertyURL, bus, configuration);

    //    this.discovery = new Discovery(hypertyURL, bus);
    this.identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);
    this.domain = divideURL(hypertyURL).domain;

    this.userAvailabilityyDescURL = 'hyperty-catalogue://catalogue.' + this.domain + '/.well-known/dataschema/Context';


//    this.heartbeat = [];

    this.syncher.onNotification((event) => {
      let _this = this;
      _this.onNotification(event);
    });
  }

start(){
  let _this = this;

  return new Promise((resolve, reject) => {

    this.syncher.resumeReporters({store: true}).then((reporters) => {

      let reportersList = Object.keys(reporters);

      if (reportersList.length  > 0) {

      console.log('[UserAvailabilityReporter.start] resuming ', reporters[reportersList[0]]);
      // set availability to available

      _this.userAvailability = reporters[reportersList[0]];

      _this._onSubscription(_this.userAvailability);

      resolve(_this.userAvailability);
      } else {
        console.log('[UserAvailabilityReporter.start] nothing to resume ', reporters);
        resolve(_this._create());
      }

    }).catch((reason) => {
      console.error('[UserAvailabilityReporter] Resume failed | ', reason);
    });
  }).catch((reason) => {
  reject('[UserAvailabilityReporter] Start failed | ', reason);
});
}

onResumeReporter(callback) {
   let _this = this;
   _this._onResumeReporter = callback;
 }

  onNotification(event) {
    let _this = this;
    console.info('userAvailability Event Received: ', event);
    console.log('from hyperty', event.from);

    event.ack();

  }

  /**
   * This function is used to create a new status object syncher
   * @param  {URL.UserURL} contacts List of Users
   * @return {Promise}
   */
  _create() {
    let _this = this;

    return new Promise((resolve, reject) => {
      console.info('[UserAvailabilityReporter.create] lets create a new User availability Context Object');
      _this.syncher.create(_this.userAvailabilityyDescURL, [], availability(), true, false, 'myAvailability', null, {resources: ['availability_context']})
      .then((userAvailability) => {
        _this.userAvailability = userAvailability;

        _this._onSubscription(userAvailability);
        resolve(userAvailability);

      }).catch(function(reason) {
        reject(reason);
      });

    });

  }

  _onSubscription(userAvailability){
    userAvailability.onSubscription((event) => {
      console.info('[UserAvailabilityReporterReporter._onSubscription] accepting: ', event);
      event.accept();
    });
  }

  setStatus(newStatus) {
    let _this = this;
    console.log('[UserAvailabilityReporterReporter.setStatus] before change :', _this.userAvailability.data);

    _this.userAvailability.data.values[0].value = newStatus;
    console.debug('[UserAvailabilityReporterReporter.setStatus] after change :', _this.userAvailability.data);
    _this.trigger('my-availability-update', newStatus);

  }


}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'UserAvailabilityReporter',
    instance: new UserAvailabilityReporter(hypertyURL, bus, configuration)
  };

}
