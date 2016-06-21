import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../utils/utils';

class BraceletSensorReporter {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    _this.firstTime = true;

    _this._domain = divideURL(hypertyURL).domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschemas/Context';

    console.log('Init BraceletSensorReporter: ', hypertyURL);
    _this._syncher = new Syncher(hypertyURL, bus, configuration);

  }

  Discover() {
    return new Promise(function(resolve,reject) {
      console.log('DISCOVERING!!');
      let _this = this;
      let devicesList = [];
      let params = {
        services: [
        ],
        allowDuplicates: true,
        scanMode: bluetoothle.SCAN_MODE_LOW_LATENCY,
        matchMode: bluetoothle.MATCH_MODE_AGGRESSIVE,
        matchNum: bluetoothle.MATCH_NUM_MAX_ADVERTISEMENT,
        callbackType: bluetoothle.CALLBACK_TYPE_ALL_MATCHES
      };

      let scanSucces = function(device) {
        console.log('scan success', device);
        if ('address' in device) {
          let newDevice = { id: device.address, name: device.name, description: 'Xiaomi Band'};
          devicesList.push(newDevice);
        }
      };
      let scanError = function() {
        console.log('scan error');
      };

      let time = setTimeout(() => {
        bluetoothle.stopScan(function(a) {
          console.log('status2', a);
          resolve(devicesList);
        }, function(b) {
          console.log('status3', b); });
      }, 5000);

      bluetoothle.initialize((a) => {
        console.log('ble initialized', a);
        bluetoothle.startScan(scanSucces, scanError, params);
      }, function() {
        console.log('ble not initialized');
      });
    });
  }

  Connect(id, options) {
    let _this = this;
    return new Promise(function(resolve,reject) {
      console.log('Connecting');

      let data = {scheme:'context', id: id, time: new Date().getTime(), values: [] };

      let params =  {
        address: id
      };
      let disconnectSuccess = function(status) {
        console.log('disconnect success', status);
        bluetoothle.reconnect(reconnectSuccess, reconnectError, params);
      };
      let disconnectError = function(status) {
        console.log('disconnect error', status);
        bluetoothle.connect(connectSuccess, connectError, params);
      };
      let discoverSuccess = function(status) {
        console.log('discover success', status);
        console.log('flag', _this.firstTime);
        if (_this.firstTime) {
          console.log('first true');
          _this.readBattery(id).then(function(battery) {
            console.log('battery', battery);
            let value = {type: 'battery', name: 'remaining battery energy level in percents', unit: '%EL', value: battery, time: new Date().getTime()};
            data.values.push(value);
            console.log('data', data);
            _this.readSteps(id).then(function(steps) {
              console.log('STEPS', steps);
              let value = {type: 'user_steps', name: 'Cumulative number of steps', unit: 'steps', value: steps, time: new Date().getTime()};
              data.values.push(value);
              console.log('data', data);
              _this.ReporterBracelet(data);
            });
          });
          console.log('first false');
          _this.firstTime = false;
        } else {
          resolve();
        }
      };
      let discoverError = function(status) {
        console.log('discover error', status);
      };
      let reconnectSuccess = function(status) {
        console.log('reconnect success', status);
        if (status.status === 'connected')
          bluetoothle.discover(discoverSuccess, discoverError, params);
      };
      let reconnectError = function(status) {
        console.log('reconnect error', status);
        if (status.message === 'Device isn\'t disconnected')
        {
          console.log('disconneting');
          bluetoothle.disconnect(disconnectSuccess, disconnectError, params);
        }
      };

      let connectSuccess = function(status) {
        console.log('connect success', status);

        if (status.status === 'connected')
          bluetoothle.discover(discoverSuccess, discoverError, params);
      };
      let connectError = function(status) {
        console.log('connect error', status);
        if (status.message === 'Device previously connected, reconnect or close for new device')
        {
          console.log('trying to reconnect');
          bluetoothle.reconnect(reconnectSuccess, reconnectError, params);
        }
      };
      bluetoothle.disconnect(disconnectSuccess, disconnectError, params);
    });
  }

  ReporterBracelet(initialData) {
    let _this = this;
    let _reporter;
    console.log('Reporter initialized');
    _this._syncher.create(_this._objectDescURL, [], initialData).then((reporter) => {
      console.info('Reporter created', reporter);
      _reporter = reporter;
      reporter.onSubscription(function(event) {
        console.log('onSubscription:', event);

        event.accept();
      });
      let isConnectedSuccess = function(status) {
        if (status.isConnected) {
          console.log('isConnectedSuccess', status);
          console.log('Already connected', status);
          _this.readBattery(initialData.id).then(function(battery) {
            let value = {type: 'battery', name: 'remaining battery energy level in percents', unit: '%EL', value: battery, time: new Date().getTime()};
            _reporter.data.values.push(value);
            _this.readSteps(initialData.id).then(function(steps) {
              let value = {type: 'user_steps', name: 'Cumulative number of steps', unit: 'steps', value: steps, time: new Date().getTime()};
              _reporter.data.values.push(value);
              console.log('data', _reporter.data.values);
            });
          });
        } else {
          console.log('isConnectedSuccess', status);
          _this.Connect(initialData.id).then(function() {
            console.log('Connected Again!');
            _this.readBattery(initialData.id).then(function(battery) {
              let value = {type: 'battery', name: 'remaining battery energy level in percents', unit: '%EL', value: battery};
              _reporter.data.values.push(value);
              _this.readSteps(initialData.id).then(function(steps) {
                let value = {type: 'user_steps', name: 'Cumulative number of steps', unit: 'steps', value: steps};
                _reporter.data.values.push(value);
                console.log('data', _reporter.data.values);
              });
            });
          });

        }
      };
      let isConnectedError = function(status) {
        console.log('isConnectedError', status);
      };
      let params = {  address: initialData.id };

      console.log('HYPERTY REPORTER : ', reporter.url);
      setInterval(() => {
        bluetoothle.isConnected(isConnectedSuccess, isConnectedError, params);
      }, 10000);
    });

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

  readSteps(bleAddress) {
    return new Promise(function(resolve,reject) {
      console.log('reading steps');
      let params = { address: bleAddress,service: 'fee0', characteristic: 'ff06'};
      let readSucess = function(status) {
        console.log('read success', status);
        let b = bluetoothle.encodedStringToBytes(status.value);
        let valor = (0xff & b[0] | (0xff & b[1]) << 8);
        resolve(valor);
      };
      let readError = function(status) {
        console.log('read error', status);
        reject(status);
      };
      bluetoothle.read(readSucess, readError, params);
    });
  }

  readBattery(bleAddress) {
    return new Promise(function(resolve,reject) {
      console.log('reading battery');
      let params = {address: bleAddress, service: 'fee0', characteristic: 'ff0c'};
      let readSucess = function(status) {
        console.log('read success', status);
        let b = bluetoothle.encodedStringToBytes(status.value);
        let valor = b[0];
        resolve(valor);
      };
      let readError = function(status) {
        console.log('read error', status);
        reject(status);
      };
      bluetoothle.read(readSucess, readError, params);
    });
  }
}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'BraceletSensorReporter',
    instance: new BraceletSensorReporter(hypertyURL, bus, configuration)
  };
}
