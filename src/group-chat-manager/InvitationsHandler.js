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

/**
* To manage Group Chat Invitations
* @author Paulo Chainho [paulo-g-chainho@alticelabs.com]
* @version 0.1.0
*/


class InvitationsHandler {

  constructor(hypertyURL) {

    if (!hypertyURL) throw Error('hypertyURL is a necessary dependecy');

    let _this = this;
    _this._hypertyURL = hypertyURL;
  }

  /**
   * This function is used to handle notifications for disconnected Hy+erties.
   * @param  {DiscoveredObject[]}    disconnected  array of discovered hyperties that are disconnected
   * @param  {DataObjectReporter}    DataObjectReporter   Data Object Reporter addressed by invitations
   */

  inviteDisconnectedHyperties(disconnected, dataObjectReporter) {

    let _this = this;
    console.log('[GroupChatManager.InvitationsHandler.invitePreviouslyDisconnectedHyperties] lets invite ', disconnected);

    disconnected.forEach((disconnectedHyperty)=>{
      disconnectedHyperty.onLive(_this._hypertyURL,()=>{
        console.log('[GroupChatManager.create] disconnected Hyperty is back to live', disconnectedHyperty);

        dataObjectReporter.inviteObservers([disconnectedHyperty.data.hypertyID]);

        disconnectedHyperty.unsubscribeLive(_this._hypertyURL);

      });

    });

  }

  /**
   * This function is used to process sent invitations. In case invitations are not acknowledge by recipient it will be handled as a disconnected hyperty
   * @param  {DiscoveredObject[]}    live  array of discovered hyperties that are or were live
   * @param  {DataObjectReporter}    DataObjectReporter   Data Object Reporter addressed by invitations
   */

  processInvitations(live, dataObjectReporter) {
    let _this = this;

    let invitations = dataObjectReporter.invitations;

    console.log('[GroupChatManager.InvitationsHandler.processInvitations] waiting for replies ', invitations);

    invitations.forEach((invitation) => {
      invitation.then(console.log).catch((result)=>{
        _this.inviteDisconnectedHyperties([live[result.invited]], dataObjectReporter);
      });
    });

  }



}

export default InvitationsHandler;
