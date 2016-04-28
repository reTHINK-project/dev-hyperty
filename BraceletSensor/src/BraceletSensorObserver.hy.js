import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../../resources/utils/utils';

class BraceletSensorObserver {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;

    _this._domain = divideURL(hypertyURL).domain;
    _this._objectDescURL = 'hyperty-catalogue://' + _this._domain + '/.well-known/dataschemas/BraceletSensorDataSchema';

    console.log('Init BraceletSensorObserver: ', hypertyURL);
    _this._syncher = new Syncher(hypertyURL, bus, configuration);
  }

  ObserveBracelet(url) {

    let _this = this;
    _this._syncher.subscribe(_this._objectDescURL, url).then((observer) => {
      observer.onChange('*', (event) => {
        console.log('what is going on');
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
