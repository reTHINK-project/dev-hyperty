//import { Syncher } from 'service-framework/dist/Syncher';
import URI from 'urijs';
//import Search from '../utils/Search';
//import IdentityManager from 'service-framework/dist/IdentityManager';
//import { Discovery } from 'service-framework/dist/Discovery';

class Wallet {

  constructor(hypertyURL, bus, config, factory) {
    let uri = new URI(hypertyURL);
    this.objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/WalletData`;
    this.syncher = factory.createSyncher(hypertyURL, bus, config);
    this.identityManager = factory.createIdentityManager(hypertyURL, config.runtimeURL, bus);
    this.discovery = factory.createDiscovery(hypertyURL, config.runtimeURL, bus);
    this.search = factory.createSearch(this.discovery, this.identityManager);
    this.currentPosition;
    this.bus = bus;
    this.identity = null;
    this.hypertyURL = hypertyURL;
    bus.addListener(hypertyURL, (msg) => {
      console.log('[Wallet] new msg', msg);
    });
    this.messageRetries = config.retries;
  }


  start(callback, identity) {
    let _this = this;

    return new Promise((resolve, reject) => {
      let userProfile;
      let publicWallets = false;
      if (identity.profile !== undefined) {
        if (identity.profile.guid === 'user-guid://public-wallets') {
          userProfile = identity.profile;
          publicWallets = true;
        } else {
          userProfile = { userURL: identity.userURL, guid: identity.guid, info: identity.profile };
        }
      } else {
        userProfile = { userURL: identity.userURL, guid: identity.guid };
      }
      _this.identity = { userProfile: userProfile };

      let createMessage = {
        type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
        identity: { userProfile: userProfile },
        body: {
          type: 'create',
          from: _this.hypertyURL,
          resource: 'wallet'
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

      _this.bus.postMessageWithRetries(createMessage, _this.messageRetries, (reply) => {

        // store address
        _this.walletAddress = reply.body.wallet.address;

        console.log('[Wallet] create Reply', reply);
        if (reply.body.code == 200) {
          _this._resumeObservers(reply.body.reporter_url).then(function (result) {

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

              let updateRanking = {
                field: 'ranking',
                data: result.data.ranking
              };

              let updateBonusCredit = {
                field: 'bonus-credit',
                data: result.data['bonus-credit']
              };

              callback(updateBalance);
              callback(updateTransactions);
              callback(updateRanking);
              callback(updateBonusCredit);


              result.onChange('*', (event) => {
                console.log('[Wallet] New Change :', event);
                callback(event);
              });
              resolve();

            } else {

              _this.syncher.subscribe(_this.objectDescURL, reply.body.reporter_url, true, false, true, false, null).then(function (obj) {
                console.log('[Wallet] subscribe result :', obj);

                let updateBalance = {
                  field: 'balance',
                  data: obj.data.balance
                };

                let updateTransactions = {
                  field: 'transactions',
                  data: obj.data.transactions
                };

                let updateRanking = {
                  field: 'ranking',
                  data: obj.data.ranking
                };

                let updateBonusCredit = {
                  field: 'bonus-credit',
                  data: obj.data['bonus-credit']
                };

                callback(updateBalance);
                callback(updateTransactions);
                callback(updateRanking);
                callback(updateBonusCredit);

                obj.onChange('*', (event) => {
                  console.log('[Wallet] New Change :', event);
                  callback(event);
                });
                resolve();


              }).catch(function (error) {
                console.log('[Wallet] error', error);
                reject();

              });
            }

            _this._resumeObservers(reply.body.publics_url).then(function (result) {
              if (result != false) {
                console.log('[Wallet] Resume public wallets :', result);

                let updateWallets = {
                  field: 'wallets',
                  data: result.data.wallets
                };

                callback(updateWallets);

                result.onChange('*', (event) => {
                  console.log('[Wallet] New Change :', event);
                  callback(event);
                });

              } else {
                _this.syncher.subscribe(_this.objectDescURL, reply.body.publics_url, true, false, true, false, null).then(function (obj) {
                  console.log('[Wallet] subscription result public wallets :', result);
                  let updateWallets = {
                    field: 'wallets',
                    data: obj.data.wallets
                  };

                  callback(updateWallets);

                  obj.onChange('*', (event) => {
                    console.log('[Wallet] New Change :', event);
                    callback(event);
                  });
                });
              }

            });

          }).catch(function (error) {

          });


        }
      });
    });

  }

  update(source, value) {
    let _this = this;

    return new Promise((resolve, reject) => {

      if (_this.identity != null ) {
        let updateMessage = {
          type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
          identity: _this.identity,
          body: {
            type: 'update',
            from: _this.hypertyURL,
            resource: source,
            value: value
          }
        };

        console.log('[Wallet] update message', updateMessage);

        _this.bus.postMessageWithRetries(updateMessage, _this.messageRetries, (reply) => {

          console.log('[Wallet] update Reply', reply);
          resolve(true);

        });
      } else {
        resolve(false);
      }


    });

  }

  removeWallet() {

    let _this = this;

    return new Promise((resolve, reject) => {

      let deleteMessage = {
        type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
        // identity: { userProfile: userProfile },
        body: {
          type: 'delete',
          from: _this.hypertyURL,
          resource: 'wallet',
          value: _this.walletAddress,
        }
      };

      console.log('[Wallet] delete message', deleteMessage);

      _this.bus.postMessage(deleteMessage, _this.messageRetries);
      resolve(true);

    })

  }

  _resumeObservers(walletURL) {
    let _this = this;

    return new Promise((resolve, reject) => {
      //debugger;
      _this.syncher.resumeObservers({ store: true }).then((observers) => {


        console.log('[VertxAppProtoStub] Resuming observer : ', observers, _this);

        let observersList = Object.keys(observers);
        if (observersList.length > 0) {
          //debugger;
          observersList.forEach((dataObjectObserverURL) => {
            console.log('[VertxAppProtoStub].syncher.resumeObserver: ', dataObjectObserverURL);
            if (walletURL == dataObjectObserverURL) {
              return resolve(observers[dataObjectObserverURL]);
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
export default function activate(hypertyURL, bus, config, factory) {
  return {
    name: 'Wallet',
    instance: new Wallet(hypertyURL, bus, config, factory)
  };
}
