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

  start(callback, identity) {
    let _this = this;
    _this.identity = identity;

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
    });
  }

  createStream() {
    let _this = this;


    let createMessage = {
      type: 'forward', to: 'runtime://sharing-cities-dsm/protostub/smart-iot', from: _this.hypertyURL,
      identity: { userProfile: { userURL: _this.identity.userURL, guid: _this.identity.guid } },
      body: {
        type: 'create',
        from: _this.hypertyURL,
        resource: 'stream',
        platformID: 'edp',
        platformUID: 'luisuserID',
        ratingType: 'private'
      }
    };


    console.log('[DeviceManager] create device message', createMessage);

    _this.bus.postMessage(createMessage, (reply) => {

      console.log('[DeviceManager] create stream Reply', reply);

  /*    if (reply.body.code == 200) {

        let objURL = 'context://sharing-cities-dsm/' + createMessage.body.platformID + '/' + createMessage.body.platformUID;

        _this._resumeObservers(objURL).then(function(result) {

          //  debugger;

          if (result != false) {
            console.log('[DeviceManager] Resume result :', result);


            result.onChange('*', (event) => {
              console.log('[DeviceManager] New Change :', event);
            });

          } else {
            _this.syncher.subscribe(_this.objectDescURL, objURL, true, false, true, null).then(function(obj) {
              console.log('[DeviceManager] subscribe result :', obj);


              obj.onChange('*', (event) => {
                console.log('[Wallet] New Change :', event);
                callback(event);
              });

            }).catch(function(error) {
              console.log('[Wallet] error', error);
            });
          }
        }).catch(function(error) {

        });


      }*/


    });
  }

  _resumeObservers(deviceManagerURL) {
    let _this = this;

    return new Promise((resolve, reject) => {
      //debugger;
      _this.syncher.resumeObservers({store: true}).then((observers) => {


        console.log('[DeviceManager] Resuming observer : ', observers, _this);

        let observersList = Object.keys(observers);
        if (observersList.length  > 0) {
          //debugger;
          observersList.forEach((dataObjectObserverURL) => {
            console.log('[DeviceManager].syncher.resumeObserver: ', dataObjectObserverURL);
            if (deviceManagerURL == dataObjectObserverURL) {
              return resolve(observers[dataObjectObserverURL]);
            }
          });
        } else {
          resolve(false);
        }
        resolve(false);

      }).catch((reason) => {
        console.info('[DeviceManager] Resume Observer | ', reason);

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
