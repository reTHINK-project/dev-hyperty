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
* The Group Chat API is used to control a Group Chat instance.
* @author Vitor Silva [vitor-t-silva@telecom.pt]
* @version 0.1.0
*/

class ChatController {

  constructor(syncher, discovery, domain, search) {

    if (!syncher) throw Error('Syncher is a necessary dependecy');
    if (!discovery) throw Error('Discover is a necessary dependecy');
    if (!domain) throw Error('Domain is a necessary dependecy');
    if (!search) throw Error('Search is a necessary dependecy');

    let _this = this;
    _this._syncher = syncher;
    _this.discovery = discovery;
    _this.search = search;
    _this.myIdentity = null;

    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/Communication';

    // syncher.onNotification(function(event) {
    //
    //   if (event.type === 'delete') {
    //     if (_this._onClose) _this._onClose(event);
    //   }
    //
    // });

  }

  set dataObjectReporter(dataObjectReporter) {

    if (!dataObjectReporter) throw new Error('The data object reporter is necessary parameter');
    let _this = this;

    dataObjectReporter.onSubscription(function(event) {
      event.accept();

      console.log('[GroupChatManager.ChatController]New user has subscribe this object: ', dataObjectReporter.data, event.identity);

      let participant = event.identity.userProfile;

      if (event.identity.legacy) {
        participant.legacy = event.identity.legacy;
      }

      let found = dataObjectReporter.data.participants.find((user) => {
        return user.userURL === participant.userURL;
      });

      if (found <= 0) {
        dataObjectReporter.data.participants.push(participant);
        if (_this._onUserAdded) _this._onUserAdded(participant);
      }

    });

    dataObjectReporter.onAddChild(function(child) {
      console.info('[GroupChatManager.ChatController]Reporter - Add Child: ', child);
      dataObjectReporter.data.lastModified = new Date().toJSON();
      if (_this._onMessage) _this._onMessage(child);
    });

    setTimeout(() => {
      let childrens = dataObjectReporter.childrens;
      Object.keys(childrens).forEach((child) => {
        if (_this._onMessage) _this._onMessage({
          childId: child,
          identity: childrens[child].identity,
          value: childrens[child].data
        });
      })
    });

    _this._dataObjectReporter = dataObjectReporter;
  }

  get dataObjectReporter() {
    let _this = this;
    return _this._dataObjectReporter;
  }

  set dataObjectObserver(dataObjectObserver) {
    let _this = this;

    _this._dataObjectObserver = dataObjectObserver;

    dataObjectObserver.onChange('*', function(event) {
      console.info('[GroupChatManager.ChatController]Observer - onChange', event);

      if (event.field.includes('participants')) {
        switch (event.cType) {
          case 'add':
            if (_this._onUserAdded) _this._onUserAdded(event);
            break;

          case 'remove':
            if (_this._onUserRemoved) _this._onUserRemoved(event);
            break;
        }
      }

      if (_this._onChange) _this._onChange(event);

    });

    dataObjectObserver.onAddChild(function(child) {
      console.info('[GroupChatManager.ChatController]Observer - Add Child: ', child);
      if (_this._onMessage) _this._onMessage(child);
    });

    setTimeout(() => {
      let childrens = dataObjectObserver.childrens;
      Object.keys(childrens).forEach((child) => {
        if (_this._onMessage) _this._onMessage({
          childId: child,
          identity: childrens[child].identity,
          value: childrens[child].data
        });
      })
    });

  }

  get dataObjectObserver() {
    let _this = this;
    return _this._dataObjectObserver;
  }

  get dataObject() {
    let _this = this;
    return _this._dataObjectReporter ? _this.dataObjectReporter : _this.dataObjectObserver;
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
   * This function is used to send a chat message.
   * @param  {string}     message                        Is the ChatMessage to be sent.
   * @return {Promise<Communication.ChatMessage>}        It returns the ChatMessage child object created by the Syncher as a Promise.
   */
  send(message) {

    let _this = this;
    let dataObject = _this.dataObjectReporter ? _this.dataObjectReporter : _this.dataObjectObserver;

    return new Promise(function(resolve, reject) {

      let _dataObjectChild;

      // TODO: change chatmessages to resource - chat, file
      // TODO: change message to hypertyResource - https://github.com/reTHINK-project/dev-service-framework/tree/develop/docs/datamodel/data-objects/hyperty-resource
      // TODO: handle with multiple resources - if the "message" will be different for each type of resources
      dataObject.addChild('chatmessages', {message: message}).then(function(dataObjectChild) {

        console.log('[GroupChatManager.ChatController][addChild - Chat Message]: ', dataObjectChild);
        _dataObjectChild = dataObjectChild;

        let identity = _this.myIdentity;

        if (!identity) {
          return _this.search.myIdentity().then((identity) => {
            return _this.myIdentity = identity;
          }).catch((reason) => {
            console.error('Add Child - Get my Identity fails', reason);
          });
        } else {
          return identity;
        }

      }).then((myIdentity) => {

        console.log('[Chat Controller] - My Identity: ', myIdentity);

        console.log('[Chat Controller] - dataObjectChild: ', _dataObjectChild);

        let msg = {
          childId: _dataObjectChild._childId,
          from: _dataObjectChild._owner,
          value: _dataObjectChild.data,
          type: 'create',
          identity: {
            userProfile: myIdentity
          }
        };

        resolve(msg);
      }).catch(function(reason) {
        console.error('Reason:', reason);
        reject(reason);
      });

    });

  }

  /**
   * [onChange description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  onChange(callback) {
    let _this = this;
    _this._onChange = callback;
  }

  /**
   * This function is used to receive new messages.
   * @param  {Function} callback Function to handle with new messages
   * @return {Communication.ChatMessage} m
   */
  onMessage(callback) {
    let _this = this;
    _this._onMessage = callback;
  }

  /**
   * [onUserAdded description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  onUserAdded(callback) {
    let _this = this;
    _this._onUserAdded = callback;
  }

  /**
   * When the an user was removed
   * @param  {Function} callback Function handle with the removed user
   * @return {[type]}            [description]
   */
  onUserRemoved(callback) {
    let _this = this;
    _this._onUserRemoved = callback;
  }

  /**
   * This function is used to receive requests to close the Group Chat instance.
   * @return {DeleteEvent} The DeleteEvent fired by the Syncher when the Chat is closed.
   */
  onClose(callback) {
    let _this = this;
    _this._onClose = callback;
  }

  /**
   * This function is used to add / invite new user on an existing Group Chat instance.
   * Only the Reporter, i.e. the Hyperty that has created the Group Chat, is allowed to use this function.
   * @param {URL.UserURL}  users  User to be invited to join the Group Chat that is identified with reTHINK User URL.
   * @return {Promise<boolean>}   It returns as a Promise true if successfully invited or false otherwise.
   */
  addUser(users, domains) {

    let _this = this;

    return new Promise(function(resolve, reject) {

      console.info('[GroupChatManager.ChatController]----------------------- Inviting users -------------------- \n');
      console.info('[GroupChatManager.ChatController]Users: ', users, '\nDomains:', domains);
      _this.search.users(users, domains, ['comm'], ['chat'])
      .then((hypertiesIDs) => {

        let selectedHyperties = hypertiesIDs.map((hyperty) => {
          return hyperty.hypertyID;
        });

        console.info('[GroupChatManager.ChatController]------------------------ Syncher Create ---------------------- \n');
        console.info('[GroupChatManager.ChatController]Selected Hyperties: !!! ', selectedHyperties);
        console.info(`Have ${selectedHyperties.length} users;`);

        if (typeof (hypertiesIDs[0]) !== 'object' && hypertiesIDs[0].split('@').length > 1) {
          console.log('[GroupChatManager.ChatController]here');
          return _this.dataObject.inviteObservers(hypertiesIDs);
        } else {
          console.log('[GroupChatManager.ChatController]here2');
          return _this.dataObject.inviteObservers(selectedHyperties);
        }



      })
      .then(function() {
        console.info('[GroupChatManager.ChatController]Are invited with success ' + users.length + ' users;');
        resolve(true);
      }).catch(function(reason) {
        console.error('An error occurred when trying to invite users;\n', reason);
        reject(false);
      });

    });

  }

  /**
   * This function is used to remove a user from an existing Group Chat instance.
   * Only the Reporter, i.e. the Hyperty that has created the Group Chat, is allowed to use this function.
   * @return {<Promise> boolean} Promise with the status
   */

  /**
   * This function is used to remove a user from an existing Group Chat instance.
   * Only the Reporter, i.e. the Hyperty that has created the Group Chat, is allowed to use this function.
   * @param  {URL.UserURL} user       User to be removed from the Group Chat that is identified with reTHINK User URL.
   * @return {<Promise> boolean}      It returns as a Promise true if successfully removed or false otherwise.
   */
  removeUser(user) {

    // TODO: implement the removeUser;
    console.log('[GroupChatManager.ChatController]Not yet implemented: ', user);

  }

  /**
   * This function is used to close an existing Group Chat instance.
   * Only available to Chat Group Reporters i.e. the Hyperty instance that created the Group Chat.
   * @return {<Promise>Boolean} It returns as a Promise true if successfully closed or false otherwise.
   */
  close() {
    // TODO: the dataObjectReporter.delete should be an Promise;

    let _this = this;

    return new Promise(function(resolve, reject) {

      try {
        _this.dataObjectReporter.delete();
        resolve(true);
      } catch (e) {
        reject(false);
      }

    });

  }

}

export default ChatController;
