import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../utils/utils';
import PersistenceManager from 'service-framework/dist/PersistenceManager';

class BraceletSensorReporter {

  constructor(hypertyURL, bus, configuration) {
    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;
    _this.firstTime = true;
    _this.reconnecting = false;

    _this._domain = divideURL(hypertyURL).domain;

    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + _this._domain + '/.well-known/dataschema/Context';

    console.log('Init BraceletSensorReporter: ', hypertyURL);
    _this._syncher = new Syncher(hypertyURL, bus, configuration);
    _this._persistenceManager = new PersistenceManager(window.localStorage);
    console.log('PM', _this._persistenceManager);
  }

  getLastDevice() {
    let _this = this;
    if (_this._onConnect) _this._onConnect(_this._persistenceManager.get('btLEAddress'));
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
      }, 10000);

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
      let data = {scheme:'context', id: id, time: new Date().getTime(), values: [] };

      let params =  {
        address: id
      };
      let disconnectSuccess = function(status) {
        console.log('disconnect success', status);
        _this.reconnecting = true;
        let statusChanged = { connection: 'reconnecting', address: id };
        if (_this._onStatusChange) _this._onStatusChange(statusChanged);
        resolve('reconnecting');
        setTimeout(() => {
          bluetoothle.reconnect(reconnectSuccess, reconnectError, params);
        }, 5000);
      };
      let disconnectError = function(status) {
        console.log('disconnect error', status);
        bluetoothle.connect(connectSuccess, connectError, params);
      };
      let discoverSuccess = function(status) {
        console.log('discover success', status);
        console.log('flag', _this.firstTime);
        _this._persistenceManager.set('btLEAddress', 0, id);
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
        if (status.status === 'connected') {
          _this.reconnecting = false;
          let statusChanged = { connection: 'connected', address: id };
          if (_this._onStatusChange) _this._onStatusChange(statusChanged);
          resolve('connected');
          console.log('Connected');
          bluetoothle.discover(discoverSuccess, discoverError, params);
        }else if (status.status === 'disconnected') {
          if (!_this.reconnecting) {
            console.log('On Reconnect Success Reconnecting after disconnect');
            _this.reconnecting = true;
            let statusChanged = { connection: 'reconnecting', address: id };
            if (_this._onStatusChange) _this._onStatusChange(statusChanged);
            resolve('reconnecting');
            setTimeout(() => {
              bluetoothle.reconnect(reconnectSuccess, reconnectError, params);
            }, 5000);
          } else {
            console.log('Already Reconnecting');
          }
        }
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

        if (status.status === 'connected') {
          resolve('connected');
          bluetoothle.discover(discoverSuccess, discoverError, params);
        }else if (status.status === 'disconnected') {
          if (!_this.reconnecting) {
            console.log('Reconnecting after disconnect');
            _this.reconnecting = true;
            let statusChanged = { connection: 'reconnecting', address: id };
            if (_this._onStatusChange) _this._onStatusChange(statusChanged);
            resolve('reconnecting');
            setTimeout(() => {
              bluetoothle.reconnect(reconnectSuccess, reconnectError, params);
            }, 5000);

          } else {
            console.log('Already Reconnecting');
          }
        }
      };
      let connectError = function(status) {
        console.log('connect error', status);
        if (status.message === 'Device previously connected, reconnect or close for new device')
        {
          console.log('trying to reconnect', _this.reconnecting);
          if (!_this.reconnecting)
          {
            _this.reconnecting = true;
            let statusChanged = { connection: 'reconnecting', address: id };
            if (_this._onStatusChange) _this._onStatusChange(statusChanged);
            resolve('reconnecting');
            console.log('trying to reconnect', _this.reconnecting);
            setTimeout(() => {
              bluetoothle.reconnect(reconnectSuccess, reconnectError, params);
            }, 5000);
          }
        }
      };
      bluetoothle.initialize((a) => {
        if (_this.reconnecting) {
          console.log('Still Reconnecting, resolve reconnecting..');
          let statusChanged = { connection: 'reconnecting', address: id };
          if (_this._onStatusChange) _this._onStatusChange(statusChanged);
        } else {
          console.log('Connecting');
          bluetoothle.connect(connectSuccess, connectError, params);
        }
      }, function(b) {
        console.log(b);
      });

    });
  }

  ReporterBracelet(initialData) {
    let _this = this;
    console.log('Reporter initialized');
    _this._syncher.create(_this._objectDescURL, [], initialData).then((reporter) => {
      console.info('Reporter created', reporter);
      _this.reporter = reporter;
      reporter.onSubscription(function(event) {
        console.log('onSubscription:', event);

        event.accept();
      });
      let isConnectedSuccess = function(status) {
        if (status.isConnected) {
          console.log('isConnectedSuccess', status);
          _this.readBattery(initialData.id).then(battery => _this.pushData(battery, initialData.id));

        } else {
          console.log('isConnectedSuccess', status);
          _this.Connect(initialData.id);
        }
      };
      let isConnectedError = function(status) {
        console.log('isConnectedError', status);
      };
      let params = {  address: initialData.id };

      console.log('HYPERTY REPORTER : ', reporter.url);
      setInterval(() => {
        bluetoothle.isConnected(isConnectedSuccess, isConnectedError, params);
      }, 2000);
    });

  }

  pushData(battery,id) {
    let _this = this;
    let value = {type: 'battery', name: 'remaining battery energy level in percents', unit: '%EL', value: battery, time: new Date().getTime()};
    _this.reporter.data.values.push(value);
    if (_this._onDataChange) _this._onDataChange(value);
    _this.readSteps(id).then(function(steps) {
      let value = {type: 'user_steps', name: 'Cumulative number of steps', unit: 'steps', value: steps, time: new Date().getTime()};
      _this.reporter.data.values.push(value);
      console.log('data', _this.reporter.data.values);
      if (_this._onDataChange) _this._onDataChange(value);
    });
  }

  readSteps(bleAddress) {
    let _this = this;
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
        _this.Connect(bleAddress);
      };
      bluetoothle.read(readSucess, readError, params);
    });
  }

  readBattery(bleAddress) {
    let _this = this;
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
        _this.Connect(bleAddress);
      };
      bluetoothle.read(readSucess, readError, params);
    });
  }

  onDataChange(callback) {
    let _this = this;
    _this._onDataChange = callback;
  }

  onStatusChange(callback) {
    let _this = this;
    _this._onStatusChange = callback;
  }

  onConnect(callback) {
    let _this = this;
    _this._onConnect = callback;
  }
}

export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'BraceletSensorReporter',
    instance: new BraceletSensorReporter(hypertyURL, bus, configuration)
  };
}
