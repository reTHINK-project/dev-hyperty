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
    this.pubsUrl = 'user://public-wallets';
    bus.addListener(hypertyURL, (msg) => {
      console.log('[Wallet] new msg', msg);
    });
    this.messageRetries = config.retries;
  }

  _resumePrivateWallet(user, callback) {

    let _this = this;

    return new Promise((resolve, reject) => {
      _this._resumeObservers(user).then(function (result) {
        console.log('[Wallet] private Resume result :', result);
      if (result) {

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

        let updateAccounts = {
          field: 'accounts',
          data: result.data.accounts
        };

        callback(updateBalance);
        callback(updateTransactions);
        callback(updateRanking);
        callback(updateBonusCredit);
        callback(updateAccounts);


        result.onChange('*', (event) => {
          console.log('[Wallet] New Change on Private: ', event);
          callback(event);
        });

        resolve(true);

      } else resolve(false);

    }).catch(function (error) {
      console.log('[Wallet] ', error);
      resolve(false);
    });
    });

  }

  _resumePublicWallet(url, callback) {

    let _this = this;

    return new Promise((resolve, reject) => {
      _this._resumeObservers(url).then(function (result) {

        console.log('[Wallet] public resume wallets :', result);
        if (result) {
  
          let updateWallets = {
            field: 'wallets',
            data: result.data.wallets
          };
  
          callback(updateWallets);
  
          result.onChange('*', (event) => {
            console.log('[Wallet] New Change on Public :', event);
            callback(event);
          });
          resolve(true);
        } else resolve(false);
  
      }).catch(function (error) {
        console.log('[Wallet] ', error);
        resolve(false);
      });
    });




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
          resource: 'wallet',
          body: { mutual: false },
          mutual: false
        }
      };
      let  resumedPrivate = false;
      let  resumedPublic = false;

      _this._resumePrivateWallet(_this.identity.userProfile.userURL, callback).then((resumed)=>{
        resumedPrivate = resumed;
        _this._resumePublicWallet(_this.pubsUrl, callback).then((resumed)=>{
          resumedPublic = resumed;
          console.log('[Wallet] create message', createMessage);

          _this.bus.postMessageWithRetries(createMessage, _this.messageRetries, (reply) => {
    
            // store address
            _this.walletAddress = reply.body.wallet.address;
    
            console.log('[Wallet] create Reply', reply);
            if (reply.body.code == 200) {
              if (! resumedPrivate) {
                console.log('[Wallet] subscribe private');
                let input = {
                  schema: _this.objectDescURL,
                  resource: reply.body.reporter_url,
                  store: true,
                  p2p: false,
                  mutual: false,
                  domain_subscription: false
    //              identity: null
                };
            
                _this.syncher.subscribe(input).then(function (obj) {
                  console.log('[Wallet] subscribe private result :', obj);
    
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

                  let updateAccounts = {
                    field: 'accounts',
                    data: obj.data.accounts
                  };
    
                  callback(updateBalance);
                  callback(updateTransactions);
                  callback(updateRanking);
                  callback(updateBonusCredit);
                  callback(updateAccounts);
    
                  obj.onChange('*', (event) => {
                    console.log('[Wallet] Private New Change :', event);
                    callback(event);
                  });
    
    
    
                }).catch(function (error) {
                  console.log('[Wallet] Private error', error);
                  reject();
    
                });
              }
    
              if (! resumedPublic) {
                console.log('[Wallet] subscribe public');
                let input = {
                  schema: _this.objectDescURL,
                  resource: reply.body.publics_url,
                  store: true,
                  p2p: false,
                  mutual: false,
                  domain_subscription: false
    //              identity: null
                };
    
                _this.syncher.subscribe(input).then(function (obj) {
                  console.log('[Wallet] subscription result public wallets :', obj);
                  let updateWallets = {
                    field: 'wallets',
                    data: obj.data.wallets
                  };
    
                  callback(updateWallets);
    
                  obj.onChange('*', (event) => {
                    console.log('[Wallet] Public New Change :', event);
                    callback(event);
                  });
                });
              }
    
              resolve(reply);
    
            }
          });
    
        });
      });

    });

  }

  update(source, value) {
    let _this = this;

    return new Promise((resolve, reject) => {

/*      if (_this.identity != null ) {
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

          console.log('[Wallet] update Reply', reply);*/
          resolve(true);
/*
        });
      } else {
        resolve(false);
      }*/


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
            if (walletURL == observers[dataObjectObserverURL]._name) {
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
