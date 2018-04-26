import { Syncher } from 'service-framework/dist/Syncher';
import URI from 'urijs';
import position from './position';
import Search from '../utils/Search';
import IdentityManager from 'service-framework/dist/IdentityManager';
import { Discovery } from 'service-framework/dist/Discovery';
import { callbackify } from 'util';

class LocationHypertyFactory {


  constructor(hypertyURL, bus, config) {
    let uri = new URI(hypertyURL);
    this.objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`;
    this.syncher = new Syncher(hypertyURL, bus, config);
    this.identityManager = new IdentityManager(hypertyURL, config.runtimeURL, bus);
    this.discovery = new Discovery(hypertyURL, config.runtimeURL, bus);
    this.search = new Search(this.discovery, this.identityManager);
    this.currentPosition = null;
    this.identity = null;
    this.bus = bus;
    this.hypertyURL = hypertyURL;
    this.reporter = null;
    this.watchID = null;


  }



  _getRegisteredUser() {
    let _this = this;

    return new Promise((resolve, reject) => {
      _this.identityManager.discoverUserRegistered().then((identity) => {
        console.log('[LocationReporter] GET MY IDENTITY:', identity);
        resolve(identity);
      }).catch((error) => {
        console.error('[LocationReporter] ERROR:', error);
        reject(error);
      });
    });

  }

  _resumeReporters() {
    let _this = this;
    //debugger;
    return new Promise((resolve, reject) => {
      _this.syncher.resumeReporters({store: true}).then((reporters) => {
        console.log('[LocationReporter] Reporters resumed', reporters);

        let reportersList = Object.keys(reporters);

        if (reportersList.length  > 0) {

          _this._getRegisteredUser().then((identity) => {

            reportersList.forEach((dataObjectReporterURL) => {
              //debugger;
              console.log(identity);
              _this.identity = identity;
              console.log('[LocationReporter] ', dataObjectReporterURL);
              console.log('[LocationReporter]', reporters[dataObjectReporterURL]);

              if (identity.userURL == reporters[dataObjectReporterURL].metadata.subscriberUsers[0] && reporters[dataObjectReporterURL].metadata.name == 'location') {
                //debugger;
                _this.reporter = reporters[dataObjectReporterURL];
                return resolve(true);
              } else {
                return resolve(false);
              }
            });
          });
        } else {
          return resolve(false);
        }
      }).catch((reason) => {
        console.info('[LocationReporter] Reporters:', reason);
      });
    });
  }

  //FOR invite checkin  -> vertx://sharing-cities-dsm/token-rating-checkin
  invite(observer) {

    let _this = this;
    _this.reporter.inviteObservers([observer]);
  }

  watchMyLocation(callback) {

    function success(pos) {
      var crd = pos.coords;
      callback(crd);
    }

    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    }

    const options = {
      enableHighAccuracy: true

      // timeout: 5000,
      // maximumAge: 0
    };

    this.watchID = navigator.geolocation.watchPosition(success, error, options);
  }

  removeWatchMyLocation() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  getLocation() {
    return this.currentPosition;
  }

  startPositionBroadcast() {
    let _this = this;
    _this.syncher.create(_this.objectDescURL, [], position(), true, false, 'location', {}, { resources: ['location-context'] })
      .then((reporter) => {
        _this.reporter = reporter;
        console.log('[LocationReporter]  DataObjectReporter', _this.reporter);
        reporter.onSubscription((event) => event.accept());
        _this.search.myIdentity().then(identity => {
          _this.identity = identity;
          navigator.geolocation.watchPosition((position) => {
            console.log('[LocationReporter] my position: ', position);
            _this.currentPosition = position;

            reporter.data.values = [
              { name: 'latitude', unit: 'lat', value: position.coords.latitude},
              { name: 'longitude', unit: 'lon', value: position.coords.longitude }
            ];
            reporter.data.time = position.timestamp;
            reporter.data.tag = identity.preferred_username;
          });
        });
      });

  }

  initPosition() {
    //debugger;
    let _this = this;
    if (_this.reporter == null) {
      _this.syncher.create(_this.objectDescURL, [], position(), true, false, 'location', {}, { resources: ['location-context'] })
        .then((reporter) => {
          _this.reporter = reporter;
          console.log('[LocationReporter]  DataObjectReporter', _this.reporter);
          reporter.onSubscription((event) => event.accept());
          _this.search.myIdentity().then(identity => {
            _this.identity = identity;
            _this.setCurrentPosition();
          });
      });
    } else {
      _this.setCurrentPosition();
    }
}

  setCurrentPosition() {
    let _this = this;
    navigator.geolocation.watchPosition((position) => {
      console.log('[LocationReporter] my position: ', position);
      _this.currentPosition = position;
      //debugger;
    });
  }

  updateLocation() {
    let _this = this;
    let latitude = _this.currentPosition.coords.latitude;
    let longitude = _this.currentPosition.coords.longitude;
    _this.reporter.data.values = [
      { name: 'latitude', unit: 'lat', value: latitude },
      { name: 'longitude', unit: 'lon', value: longitude }
    ];
    _this.reporter.data.time = _this.currentPosition.timestamp;
    _this.reporter.data.tag = _this.identity.preferred_username;
  }

  checkin(spotId) {
    let _this = this;
    let latitude = _this.currentPosition.coords.latitude;
    let longitude = _this.currentPosition.coords.longitude;
    _this.reporter.data.values = [
      { name: 'latitude', unit: 'lat', value: latitude },
      { name: 'longitude', unit: 'lon', value: longitude },
      { name: 'checkin', unit: 'checkin', value: spotId }
    ];
  }

  // can call with 'data://sharing-cities-dsm/shops'
  retrieveSpots(spotsURL) {

    return new Promise((resolve) => {
      let _this = this;

      let createMessage = {
        type: 'forward', to: spotsURL, from: _this.hypertyURL,
        body: {
          from: _this.hypertyURL,
          type: 'read'
        }
      };


      console.log('location-reporter-retrieveSpots()', createMessage);

      _this.bus.postMessage(createMessage, (reply) => {
        resolve(reply);
        console.log('location-reporter-retrieveSpots() reply: ', reply);
      });

    });

  }

}

export default function activate(hypertyURL, bus, config) {
  return {
    name: 'LocationReporter',
    instance: new LocationHypertyFactory(hypertyURL, bus, config)
  };
}
