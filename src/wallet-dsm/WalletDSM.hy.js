import { Syncher } from 'service-framework/dist/Syncher';
import URI from 'urijs';
import Search from '../utils/Search';
import IdentityManager from 'service-framework/dist/IdentityManager';
import { Discovery } from 'service-framework/dist/Discovery';

class WalletDSM {

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
    this.myWallet = null;
    this.start();
    bus.addListener(hypertyURL, (msg) => {
      console.log('WalletDSM new msg', msg);
    });
  }


  start() {
    let _this = this;

    // send request to create wallet (to subscription manager in Vertx P2P Stub)
    /*
    _this.search.myIdentity().then(identity => {
      _this.identity = identity;
      console.log('WalletDSM identity', identity);
    });
    */

    // TODO - userUrl
    let userURL = 'user://sharing-cities-dsm/userWalletIdentity';


    let createMessage = {
      type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
      identity: { userProfile: { userURL: userURL } },
      body: {
        from: _this.hypertyURL,
        to: 'hyperty://sharing-cities-dsm/wallet-manager',
        type: 'create'
      }
    };


    console.log('WalletDSM create message', createMessage);

    _this.bus.postMessage(createMessage, (reply) => {


      console.log('WalletDSM create Reply', reply);
      
      if (reply.body.code == 200) {
        
        debugger;
        // wallet was created -> subscribe
        _this.myWallet = reply.body.wallet;
        let subscriptionURL = reply.body.wallet.address + '/subscription';

        let subscribeMessage = {
          type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
          identity: { userProfile: { userURL: userURL } },
          body: {
            from: _this.hypertyURL,
            to: subscriptionURL,
            type: 'create'
          },
          address: reply.body.wallet.address
        };
        _this.bus.postMessage(subscribeMessage, (reply2) => {
          console.log('WalletDSM subscription Reply', reply2);

          if (reply2.body.code == 200) {
            // TODO - listen for updates
            _this.bus.addListener(_this.hypertyURL + '/changes', (msg) => {
              _this.update(msg);
            });
          }
        });
      }
    });
  }

  update(msg) {
    console.log('WalletDSM update', msg);

  }
}
export default function activate(hypertyURL, bus, config) {
  return {
    name: 'WalletDSM',
    instance: new WalletDSM(hypertyURL, bus, config)
  };
}
