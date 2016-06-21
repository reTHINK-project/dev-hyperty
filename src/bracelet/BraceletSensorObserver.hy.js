import IdentityManager from 'service-framework/dist/IdentityManager';
import {Syncher} from 'service-framework/dist/Syncher';
import Discovery from 'service-framework/dist/Discovery';
import {divideURL} from '../utils/utils';
import Search from './Search';

class BraceletSensorObserver {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);
    _this._domain = divideURL(hypertyURL).domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschemas/Context';

    console.log('Init BraceletSensorObserver: ', hypertyURL);
    _this._syncher = new Syncher(hypertyURL, bus, configuration);
    let discovery = new Discovery(hypertyURL, bus);
    _this._discovery = discovery;
    console.log('asd1');
    _this.identityManager = identityManager;
    console.log('asd3');
    _this.search = new Search(discovery, identityManager);
    console.log('asd4');
  }

  discovery(email)
  {
    let _this = this;
    return new Promise(function(resolve,reject) {
      _this.search.users([email]).then(function(a) {
        resolve(a);
      });
    });
  }

  ObserveBracelet(url) {

    let _this = this;
    _this._syncher.subscribe(_this._objectDescURL, url).then((observer) => {
      console.log('data object observer', observer);
      observer.onChange('*', (event) => {
        console.log('event->->->->->:', event);
      });
    });

  }
}

export default function activate(hypertyURL, bus, configuration) {
  window.braceletSensorObserver = new BraceletSensorObserver(hypertyURL, bus, configuration);
  return {
    name: 'BraceletSensorObserver',
    instance: window.braceletSensorObserver
  };
}
