import { Syncher } from 'service-framework/dist/Syncher';
import URI from 'urijs';
import position from './position';
import Search from '../utils/Search';
import IdentityManager from 'service-framework/dist/IdentityManager';
import {Discovery} from 'service-framework/dist/Discovery';

class walletDSM {

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

  }

}

export default function activate(hypertyURL, bus, config) {
  return {
    name: 'walletDSM',
    instance: new walletDSM(hypertyURL, bus, config)
  };
}
