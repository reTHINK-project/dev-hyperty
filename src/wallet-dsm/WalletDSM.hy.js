import { Syncher } from 'service-framework/dist/Syncher';
import URI from 'urijs';
import Search from '../utils/Search';
import IdentityManager from 'service-framework/dist/IdentityManager';
import {Discovery} from 'service-framework/dist/Discovery';

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

    this.start();
  }


  start(){
    let _this = this;

    let userURL = 'user://sharing-cities-dsm/userWalletIdentity';
    let createMessage = {
      type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
      identity: { userProfile : { userURL: userURL }},
      body: {
        from: _this.hypertyURL,
        to: 'hyperty://sharing-cities-dsm/wallet-manager',
        type: 'create'
      }};

    console.log('WalletDSM create message', createMessage);

    _this.bus.postMessage(createMessage,  (reply) => {

      console.log('WalletDSM create Reply', reply);
      if (reply.body.code == 200) {
        let subscriptionURL = reply.body.newWallet.address + '/subscription';

        let subscribeMessage = {
          type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
          identity: { userProfile : { userURL: userURL }},
          body: {
            from: _this.hypertyURL,
            to: subscriptionURL,
            type: 'create'
          },
          address: reply.body.newWallet.address};
          _this.bus.postMessage(subscribeMessage,  (reply2) => { console.log('WalletDSM subscription Reply', reply2); });
      }
    });
  }
}
export default function activate(hypertyURL, bus, config) {
  return {
    name: 'WalletDSM',
    instance: new WalletDSM(hypertyURL, bus, config)
  };
}
