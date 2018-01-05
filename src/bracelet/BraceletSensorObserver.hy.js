import IdentityManager from 'service-framework/dist/IdentityManager';
import {Syncher} from 'service-framework/dist/Syncher';
import {Discovery} from 'service-framework/dist/Discovery';
import {divideURL} from '../utils/utils';
import Search from '../utils/Search';

class BraceletSensorObserver {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');
    let _this = this;
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);
    console.log('[BraceletSensorObserverHyperty] hypertyURL->', hypertyURL);
    _this._domain = divideURL(hypertyURL).domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschema/Context';

    console.log('[BraceletSensorObserverHyperty] Init BraceletSensorObserver: ', hypertyURL);
    _this._syncher = new Syncher(hypertyURL, bus, configuration);
    let discovery = new Discovery(hypertyURL, configuration.runtimeURL, bus);
    _this._discovery = discovery;
    _this.identityManager = identityManager;
    _this.search = new Search(discovery, identityManager);
    window.discovery = _this._discovery;
  }

  discovery(email,domain)
  {
    let _this = this;
    return new Promise(function(resolve,reject) {
      _this.search.users([email], [domain], ['context'], ['steps', 'battery']).then(function(a) {
        console.log('[BraceletSensorObserverHyperty] result search users->', a);
        resolve(a);
      });
    });
  }

  connect(hypertyID)
  {
    let _this = this;
    let hypertyDomain = divideURL(hypertyID).domain;
    console.log('[BraceletSensorObserverHyperty] Connecting with hyperty ', hypertyID, hypertyDomain);
    return new Promise(function(resolve,reject) {
        _this._discovery.discoverDataObjectsPerReporter(hypertyID, [], [],  hypertyDomain).then(function(dataObject) {
          console.log('[BraceletSensorObserverHyperty] discovery dataobject', dataObject[0]);
          resolve(dataObject[0]);
        }).catch((error) => {
          console.log('[BraceletSensorObserverHyperty] ERROR-> ', error);
        });
      });
  }

  ObserveBracelet(url) {
    let _this = this;
    return new Promise(function(resolve,reject) {
        console.log('[BraceletSensorObserverHyperty] Lets subscribe -> ObjDecUrl', _this._objectDescURL, ' url-> ', url);
        _this._syncher.subscribe(_this._objectDescURL, url, false, false, false).then((observer) => {
          console.log('[BraceletSensorObserverHyperty] data object observer', observer);
          resolve(observer);
          observer.onChange('*', (event) => {
            console.log('[BraceletSensorObserverHyperty] event->->->->->:', event);
            if (_this._onChange) _this._onChange(event);
          });
        }).catch((error) => {
          console.log('[BraceletSensorObserverHyperty] ERROR-> ', error);
        });
      });

  }

  onChange(callback) {
    let _this = this;
    _this._onChange = callback;
  }
}

export default function activate(hypertyURL, bus, configuration) {
  return {
    name: 'BraceletSensorObserver',
    instance: new BraceletSensorObserver(hypertyURL, bus, configuration)
  };
}
