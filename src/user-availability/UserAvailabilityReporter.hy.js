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
//import {Discovery} from 'service-framework/dist/Discovery';
import IdentityManager from 'service-framework/dist/IdentityManager';
//import {Syncher} from 'service-framework/dist/Syncher';
import {ContextReporter} from 'service-framework/dist/ContextManager';

// Utils
//import EventEmitter from '../utils/EventEmitter.js';
//import {divideURL} from '../utils/utils.js';
//import URI from 'urijs';

import availability from './availability.js';

/**
* Hyperty User Availability;
* @author Paulo Chainho  [paulo-g-chainho@alticelabs.com]
* @version 0.1.0
*/
class UserAvailabilityReporter extends ContextReporter {

  constructor(hypertyURL, bus, configuration) {

    super(hypertyURL, bus, configuration);
    let _this = this;

    console.info('[UserAvailabilityReporter] started with url: ', hypertyURL);

//    this.syncher = new Syncher(hypertyURL, bus, configuration);

    //    this.discovery = new Discovery(hypertyURL, bus);
    this.identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);
/*    this.domain = divideURL(hypertyURL).domain;

    this.userAvailabilityyDescURL = 'hyperty-catalogue://catalogue.' + this.domain + '/.well-known/dataschema/Context';
*/

//    this.heartbeat = [];

    this.syncher.onNotification((event) => {
      let _this = this;
      _this.processNotification(event);
    });


/*    this.syncher.onClose((event) => {

      console.log('[UserAvailabilityReporter.onClose]')
      let _this = this;
      _this.setStatus('unavailable');
      event.ack();
    });*/

  }

start(){
  let _this = this;

  return new Promise((resolve, reject) => {
    console.log('[UserAvailabilityReporter.starting]' );

    this.syncher.resumeReporters({store: true}).then((reporters) => {

      let reportersList = Object.keys(reporters);

      if (reportersList.length  > 0) {

      //TODO: filter from contexts instead of returning context[0]

      _this.contexts[0] = _this._filterResumedContexts(reporters);

      console.log('[UserAvailabilityReporter.start] resuming ', reporters);
      // set availability to available

      _this._onSubscription(_this.contexts[0]);

/*      _this.userAvailability = reporters[reportersList[0]];

      _this._onSubscription(_this.userAvailability);*/

      resolve(_this.contexts[0]);
      } else {
        console.log('[UserAvailabilityReporter.start] nothing to resume ', reporters);
        let name = 'myAvailability';
        resolve(_this.create(name, availability(), ['availability_context'], name));
      }

    }).catch((reason) => {
      console.error('[UserAvailabilityReporter] Resume failed | ', reason);
    });
  }).catch((reason) => {
  reject('[UserAvailabilityReporter] Start failed | ', reason);
});
}

// return my resumed context

_filterResumedContexts(reporters) {
  let last = 0;

  return Object.keys(reporters)
    .filter(reporter => reporters[reporter].reporter === this.syncher._owner)
    .reduce((obj, key) => {
      if (reporters[key].lastModified > last) obj = reporters[key];
      return obj;
    }, {});
}

onResumeReporter(callback) {
   let _this = this;
   _this._onResumeReporter = callback;
 }
/*
  onNotification(event) {
    let _this = this;
    console.info('userAvailability Event Received: ', event);
    console.log('from hyperty', event.from);

    event.ack();

  }*/

  /**
   * This function is used to create a new status object syncher
   * @param  {URL.UserURL} contacts List of Users
   * @return {Promise}
   */
  create(id, init, resources, name = 'myContext') {
    return super.create(id, init, resources, name);
  }

/*  _onSubscription(userAvailability){
    userAvailability.onSubscription((event) => {
      console.info('[UserAvailabilityReporterReporter._onSubscription] accepting: ', event);
      event.accept();
    });
  }*/

  setStatus(newStatus) {
    return super.setStatus('myAvailability', newStatus);
  }


}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'UserAvailabilityReporter',
    instance: new UserAvailabilityReporter(hypertyURL, bus, configuration)
  };

}
