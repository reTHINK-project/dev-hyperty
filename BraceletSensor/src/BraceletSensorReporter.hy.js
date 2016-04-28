import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../../resources/utils/utils';

class BraceletSensorReporter {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;

    _this._domain = divideURL(hypertyURL).domain;
    _this._objectDescURL = 'hyperty-catalogue://' + _this._domain + '/.well-known/dataschemas/BraceletSensorDataSchema';

    console.log('Init BraceletSensorReporter: ', hypertyURL);
    _this._syncher = new Syncher(hypertyURL, bus, configuration);

    let initialData = {
      communication: { name: 'BraceletSensorReporter' },
      BtAddress: '000A3A58F310',
      NSteps: 10000,
      Name: 'xiaomi X',
      Battery: 50,
      LeParams: {
        connIntMin: 1.25,
        connIntMax: 1.25,
        latency: 15.0,
        timeout: 10.0,
        connInt: 1.25,
        advInt: 0.625
      },
      Pulse: 0
    };

    _this._syncher.create(_this._objectDescURL, [], initialData).then((reporter) => {
      console.info('Reporter created', reporter);

      reporter.onSubscription(function(event) {
        console.log('onSubscription:', event);

        event.accept();
      });

      console.log('URL : ', reporter.url);
      let data = reporter.data;
      setInterval(() => {
        let value = Math.random() * 50 + 50;
        console.log('Pulse: ', value);
        data.Pulse = value;
        let value2 = Math.random() * 100;
        data.NSteps = data.NSteps + Math.trunc(value2);
        console.log('NSTEPS->', data.NSteps);
      }, 5000);
    });

  }
}

export default function activate(hypertyURL, bus, configuration) {
  window.braceletSensorReporter = new BraceletSensorReporter(hypertyURL, bus, configuration);
  return {
    name: 'BraceletSensorReporter',
    instance: window.braceletSensorReporter
  };
}
