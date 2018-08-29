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
//import IdentityManager from 'service-framework/dist/IdentityManager';
//import {Syncher} from 'service-framework/dist/Syncher';
//import {ContextReporter} from 'service-framework/dist/ContextManager';

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
class UserAvailabilityReporter {

  constructor(hypertyURL, bus, configuration, factory) {

    this._context = factory.createContextReporter(hypertyURL, bus, configuration);
    let _this = this;

    console.info('[UserAvailabilityReporter] started with url: ', hypertyURL);

//    this.syncher = new Syncher(hypertyURL, bus, configuration);

    //    this.discovery = new Discovery(hypertyURL, bus);
    this.identityManager = factory.createIdentityManager(hypertyURL, configuration.runtimeURL, bus);
/*    this.domain = divideURL(hypertyURL).domain;

    this.userAvailabilityyDescURL = 'hyperty-catalogue://catalogue.' + this.domain + '/.well-known/dataschema/Context';
*/

//    this.heartbeat = [];

    this.context.syncher.onNotification((event) => {
      let _this = this;
      _this.context.processNotification(event);
    });


/*    this.syncher.onClose((event) => {

      console.log('[UserAvailabilityReporter.onClose]')
      let _this = this;
      _this.setStatus('unavailable');
      event.ack();
    });*/

  }

get context() {
  return this._context;
}

start(){
  let _this = this;

  return new Promise((resolve, reject) => {
    console.log('[UserAvailabilityReporter.starting]' );

    _this.context.syncher.resumeReporters({store: true}).then((reporters) => {

      let reportersList = Object.keys(reporters);

      if (reportersList.length  > 0) {

      //TODO: filter from contexts instead of returning context[0]

      _this.context.contexts['myAvailability'] = _this._filterResumedContexts(reporters);

      console.log('[UserAvailabilityReporter.start] resuming ', _this.context.contexts['myAvailability']);
      // set availability to available

      _this.context._onSubscription(_this.context.contexts['myAvailability']);

/*      _this.userAvailability = reporters[reportersList[0]];

      _this._onSubscription(_this.userAvailability);*/

      resolve(_this.context.contexts['myAvailability']);
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
    .filter(reporter => reporters[reporter].metadata.reporter === this.context.syncher._owner)
    .reduce((obj, key) => {
      if (Date.parse(reporters[key].metadata.lastModified) > last) obj = reporters[key];
      return obj;
    }, {});
}

onResumeReporter(callback) {
   let _this = this;
   _this.context._onResumeReporter = callback;
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
    return this.context.create(id, init, resources, name);
  }

/*  _onSubscription(userAvailability){
    userAvailability.onSubscription((event) => {
      console.info('[UserAvailabilityReporterReporter._onSubscription] accepting: ', event);
      event.accept();
    });
  }*/

  setStatus(newStatus) {
//    _this.contexts[id].data.values[0].value;
    let newContext = [{value: newStatus}];
    return this._context.setContext('myAvailability', newContext);
  }


}

export default function activate(hypertyURL, bus, configuration, factory) {

  return {
    name: 'UserAvailabilityReporter',
    instance: new UserAvailabilityReporter(hypertyURL, bus, configuration, factory)
  };

}
