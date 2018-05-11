import { Syncher } from 'service-framework/dist/Syncher';
import URI from 'urijs';
import Search from '../utils/Search';
import IdentityManager from 'service-framework/dist/IdentityManager';
import { Discovery } from 'service-framework/dist/Discovery';

class Wallet {

  constructor(hypertyURL, bus, config) {
    let uri = new URI(hypertyURL);
    this.objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Wallet`;
    this.syncher = new Syncher(hypertyURL, bus, config);
    this.identityManager = new IdentityManager(hypertyURL, config.runtimeURL, bus);
    this.discovery = new Discovery(hypertyURL, config.runtimeURL, bus);
    this.search = new Search(this.discovery, this.identityManager);
    this.currentPosition;
    this.bus = bus;
    this.hypertyURL = hypertyURL;
    bus.addListener(hypertyURL, (msg) => {
      console.log('[Wallet] new msg', msg);
    });
  }

  start(callback, identity) {
    let _this = this;

    let createMessage = {
      type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
      identity: { userProfile: { userURL: identity.userURL } },
      body: {
        type: 'create',
        from: _this.hypertyURL
      }
    };

    /*Create Message should be like THIS
    *
    *  let createMessage = {
    *    type: 'create', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
    *    identity: { userProfile: { userURL: userURL } },
    *  };
    *
    */
    console.log('[Wallet] create message', createMessage);

    _this.bus.postMessage(createMessage, (reply) => {

      console.log('[Wallet] create Reply', reply);
      if (reply.body.code == 200) {
        _this._resumeObservers(reply.body.reporter_url).then(function(result) {

        //  debugger;

          if (result != false) {
            console.log('[Wallet] Resume result :', result);

            let updateBalance = {
              field: 'balance',
              data: result.data.balance
            };

            let updateTransactions = {
              field: 'transactions',
              data: result.data.transactions
            };

            callback(updateBalance);
            callback(updateTransactions);

            result.onChange('*', (event) => {
              console.log('[Wallet] New Change :', event);
              callback(event);
            });

          } else {
            _this.syncher.subscribe(_this.objectDescURL, reply.body.reporter_url, true, false, true, null).then(function(obj) {
              console.log('[Wallet] subscribe result :', obj);

              let updateBalance = {
                field: 'balance',
                data: obj.data.balance
              };

              let updateTransactions = {
                field: 'transactions',
                data: obj.data.transactions
              };

              callback(updateBalance);
              callback(updateTransactions);

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

      }
    });
  }

  _resumeObservers(walletURL) {
    let _this = this;

    return new Promise((resolve, reject) => {
      //debugger;
      _this.syncher.resumeObservers({store: true}).then((observers) => {


        console.log('[VertxAppProtoStub] Resuming observer : ', observers, _this);

        let observersList = Object.keys(observers);
        if (observersList.length  > 0) {
          //debugger;
          observersList.forEach((dataObjectObserverURL) => {
            console.log('[VertxAppProtoStub].syncher.resumeObserver: ', dataObjectObserverURL);
            if (walletURL == dataObjectObserverURL) {
              resolve(observers[dataObjectObserverURL]);
            }
          });
        } else {
          resolve(false);
        }
        resolve(false);

      }).catch((reason) => {
        console.info('[GroupChatManager] Resume Observer | ', reason);

      });
    });
  }

}
export default function activate(hypertyURL, bus, config) {
  return {
    name: 'Wallet',
    instance: new Wallet(hypertyURL, bus, config)
  };
}
