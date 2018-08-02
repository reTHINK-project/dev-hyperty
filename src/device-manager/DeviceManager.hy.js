import { Syncher } from 'service-framework/dist/Syncher';
import URI from 'urijs';
import Search from '../utils/Search';
import IdentityManager from 'service-framework/dist/IdentityManager';
import { Discovery } from 'service-framework/dist/Discovery';

class DeviceManager {

  constructor(hypertyURL, bus, config) {
    let uri = new URI(hypertyURL);
    this.objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`;
    this.syncher = new Syncher(hypertyURL, bus, config);
    this.identityManager = new IdentityManager(hypertyURL, config.runtimeURL, bus);
    this.discovery = new Discovery(hypertyURL, config.runtimeURL, bus);
    this.search = new Search(this.discovery, this.identityManager);
    this.currentPosition;
    this.bus = bus;
    this.hypertyURL = hypertyURL;
    bus.addListener(hypertyURL, (msg) => {
      console.log('[DeviceManager] new msg', msg);
    });
    this.identity = null;
  }

  start(identity) {
    let _this = this;
    _this.identity = identity;
  }

  createDevice() {
    let _this = this;

    return new Promise(function(resolve, reject) {
      let createMessage = {
        type: 'forward', to: 'runtime://sharing-cities-dsm/protostub/smart-iot', from: _this.hypertyURL,
        identity: { userProfile: { userURL: _this.identity.userURL, guid: _this.identity.guid } },
        body: {
          type: 'create',
          from: _this.hypertyURL,
          resource: 'device',
          name: 'device Name',
          description: 'device description'
        }
      };
      console.log('[DeviceManager] create device message', createMessage);

      _this.bus.postMessage(createMessage, (reply) => {
        console.log('[DeviceManager] create device Reply', reply);
        resolve(reply);
      });

    });

  }

  //'edp', 'luisuserID'
  createEndpoint(platformID, platformUID) {
    let _this = this;

    return new Promise(function(resolve, reject) {

      let createMessage = {
        type: 'forward', to: 'runtime://sharing-cities-dsm/protostub/smart-iot', from: _this.hypertyURL,
        identity: { userProfile: { userURL: _this.identity.userURL, guid: _this.identity.guid } },
        body: {
          type: 'create',
          from: _this.hypertyURL,
          resource: 'stream',
          platformID: platformID,
          platformUID: platformUID,
          ratingType: 'private'
        }
      };

      console.log('[DeviceManager] create device message', createMessage);

      _this.bus.postMessage(createMessage, (reply) => {

        console.log('[DeviceManager] create stream Reply', reply);
        resolve(reply);
      });

    });
  }

  removeEndpoint(name) {
    let _this = this;

    return new Promise(function(resolve, reject) {

      let createMessage = {
        type: 'forward', to: 'runtime://sharing-cities-dsm/protostub/smart-iot', from: _this.hypertyURL,
        identity: { userProfile: { userURL: _this.identity.userURL, guid: _this.identity.guid } },
        body: {
          type: 'delete',
          from: _this.hypertyURL,
          resource: 'stream',
          value: name
        }
      };

      console.log('[DeviceManager] remove stream message', createMessage);

      _this.bus.postMessage(createMessage, (reply) => {

        console.log('[DeviceManager] remove stream Reply', reply);
        resolve(reply);
      });

    });
  }

  removeDevice(deviceID) {
    let _this = this;

    return new Promise(function(resolve, reject) {

      let createMessage = {
        type: 'forward', to: 'runtime://sharing-cities-dsm/protostub/smart-iot', from: _this.hypertyURL,
        identity: { userProfile: { userURL: _this.identity.userURL, guid: _this.identity.guid } },
        body: {
          type: 'delete',
          from: _this.hypertyURL,
          resource: 'device',
          value: deviceID
        }
      };

      console.log('[DeviceManager] remove device message', createMessage);

      _this.bus.postMessage(createMessage, (reply) => {

        console.log('[DeviceManager] remove device Reply', reply);
        resolve(reply);
      });

    });
  }


}
export default function activate(hypertyURL, bus, config) {
  return {
    name: 'DeviceManager',
    instance: new DeviceManager(hypertyURL, bus, config)
  };
}
