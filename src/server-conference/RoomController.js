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

/* jshint undef: true */



import peer from './peer';

class RoomController {

  constructor(syncher, domain, configuration) {

    if (!syncher) throw new Error('The syncher is a needed parameter');
    if (!domain) throw new Error('The domain is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;

    this.peer = peer;
    this.roomobj = {};
    this.objReporter = {};

    this.syncher = syncher;
    this.configuration = configuration.webrtc;
    this.domain = domain;
    this.objectDescURL = 'hyperty-catalogue://catalogue.' + this.domain + '/.well-known/dataschema/Connection';
  }

  /**
  * Set the dataObject in the controller
  * @param {ConnectionDataObject} dataObject - have all information about the syncher object;
  */

  set dataObjectReporter(dataObjectReporter) {
    if (!dataObjectReporter) throw new Error('The Data Object Reporter is a needed parameter');
    let _this = this;
    console.log('set data object reporter: ', dataObjectReporter);

    _this._dataObjectReporter = dataObjectReporter;
 
    dataObjectReporter.onSubscription(function(event) {
      console.log('----------------------- got subscription ------------------------------------');
      event.accept();
    });
  }

  /**
  * return the dataObject in the controller
  * @return {ConnectionDataObject} dataObject
  */

  get dataObjectReporter() {
    let _this = this;
    return _this._dataObjectReporter;
  }

  /**
  * Set the dataObject in the controller
  * @param {ConnectionDataObject} dataObject - have all information about the syncher object;
  */

  set dataObjectObserver(dataObjectObserver) {
    if (!dataObjectObserver) throw new Error('The Data Object Observer is a needed parameter');

    let _this = this;
    // object observer from the peer joining the room including sdp of the peer
    console.log('set data object observer: ');
    _this._dataObjectObserver = dataObjectObserver;
    // _this._changePeerInformation(dataObjectObserver);
  }

  /**
  * return the dataObject in the controller
  * @return {ConnectionDataObject} dataObject
  */

  get dataObjectObserver() {
    let _this = this;
    return _this._dataObjectObserver;
  }

  /**
   * Set the connection event to accept or reject
   * @param  {CreateEvent} event Event with actions to accept or reject the connection
   */

  set connectionEvent(event) {
    let _this = this;
    _this._connectionEvent = event;
  }

  set roomName(roomName) {
    let _this = this;
    _this._roomName = roomName;
  }

  // get room(event) {
  //   let _this = this;
  //   return _this.room[roomName]; 
  // }

  /**
   * Get the connection event to accept or reject
   * @return {CreateEvent}
   */

  get connectionEvent() {
    let _this = this;
    return _this._connectionEvent;
  }
  createNewRoom(roomName) {

    let _this = this;
    let syncher = _this.syncher;

    console.log('Remote Peer Information: ', _this.dataObjectObserver.data);
    let remotePeer = _this.dataObjectObserver.data.reporter;

    return new Promise(function(resolve, reject) {
      try {
        console.log('------------------------ Syncher Create ---------------------- \n');
        syncher.create(_this.objectDescURL, [remotePeer], _this.peer).then(function(dataObjectReporter) {
          console.log('2. Return the Data Object Reporter ', dataObjectReporter);
          _this.dataObjectReporter = dataObjectReporter;
          resolve(true);
          
        }).catch(function(reason) {
          console.error(reason);
          reject(false);
        });

      } catch (e) {
        reject('error accepting connection');
      }
    });
  }

}

export default RoomController;
