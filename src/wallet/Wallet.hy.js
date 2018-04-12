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
    this.myWallet = null;
    console.log(this.identityManager);

    //debugger;
    // this.start();

    bus.addListener(hypertyURL, (msg) => {
      console.log('Wallet new msg', msg);
    });
  }


  start(callback) {
    let _this = this;


    // send request to create wallet (to subscription manager in Vertx P2P Stub)


    /*
        _this.identityManager.discoverUserRegistered().then(result => {
          console.log('asd',result);
          debugger;
        }).catch(result => {
          console.log('asd',result);
          debugger;
        });*/


    // TODO - userUrl
    let userURL = 'user://google.com/rafaelfelgueiras1993@gmail.com';


    let createMessage = {
      type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
      identity: { userProfile: { userURL: userURL } },
      body: {
        from: _this.hypertyURL,
        to: 'hyperty://sharing-cities-dsm/wallet-manager',
        type: 'create'
      }
    };


    console.log('Wallet create message', createMessage);

    _this.bus.postMessage(createMessage, (reply) => {


      console.log('Wallet create Reply', reply);
      if (reply.body.code == 200) {

        _this.syncher.subscribe(_this.objectDescURL, reply.body.reporter_url, true, false, true, null).then(function(obj) {
          console.log('[Wallet] subscribe result :', obj);

          callback(obj.data.balance);

          obj.onChange('*', (event) => {
            console.log('[VertxAppProtoStub] New Change :', event);

            callback(event.data);


          });

        }).catch(function(error) {

          console.log('[VertxAppProtoStub] error', error);
        });


        /*

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
                  console.log('Wallet subscription Reply', reply2);

                  if (reply2.body.code == 200) {
                    // TODO - listen for updates
                    _this.bus.addListener(_this.hypertyURL + '/changes', (msg) => {
                      _this.update(msg);
                    });
                  }
                });*/
      }
    });
  }

}
export default function activate(hypertyURL, bus, config) {
  return {
    name: 'Wallet',
    instance: new Wallet(hypertyURL, bus, config)
  };
}
