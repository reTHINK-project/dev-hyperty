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


    let announcementMessage = {
      type: 'forward', to: 'hyperty://sharing-cities-dsm/location-url', from: this.hypertyURL,
      body: {
        events: [{
          type: 'create',
          resources: ['adssadas'],
          url: 'asdsadas' }],
        from: this.hypertyURL
      }};

    console.log('WHATISGOINGON! hyperty DSM', announcementMessage);
    this.bus.postMessage(announcementMessage);

  }

}

export default function activate(hypertyURL, bus, config) {
  return {
    name: 'WalletDSM',
    instance: new WalletDSM(hypertyURL, bus, config)
  };
}
