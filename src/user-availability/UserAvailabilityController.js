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
import EventEmitter from '../utils/EventEmitter';

/**
* The UserAvailabilityController API is used to control the observation of one UserAvailability object instance.
* @author Paulo Chainho [paulo-g-chainho@alticelabs.com]
* @version 0.1.0
*/

class UserAvailabilityController extends EventEmitter {

  constructor(userAvailability) {

    if (!userAvailability) throw Error('[UserAvailabilityController constructir] userAvailability input parameter is mandatory ');

    let _this = this;

    _this._userAvailability = userAvailability;
  }

  observe() {
    let _this = this;

    _this._userAvailability.onChange('*', (event) => {
      console.log('[UserAvailabilityController.observe] Availability changed:', event);

      _this.trigger(_this._userAvailability.url, event);

      if (_this._onChange) _this.onChange(event);
    });

  }

  onChange(callback) {
    let _this = this;
    _this._onChange = callback;
  }

  get dataObject() {
    return this.userAvailability;
  }

  set closeEvent(event) {
    let _this = this;
    _this._closeEvent = event;

    if (_this._onClose) _this._onClose(event);
  }

  get closeEvent() {
    let _this = this;
    return _this._closeEvent;
  }

  /**
   * This function is used to receive requests to close the Group Chat instance.
   * @return {DeleteEvent} The DeleteEvent fired by the Syncher when the UserAvailability is deleted.
   */
  onClose(callback) {
    let _this = this;
    _this._onClose = callback;
  }



}

export default UserAvailabilityController;
