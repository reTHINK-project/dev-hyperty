import { Syncher } from 'service-framework/dist/Syncher';
import URI from 'urijs';
import position from './position';
import Search from '../utils/Search';
import IdentityManager from 'service-framework/dist/IdentityManager';
import {Discovery} from 'service-framework/dist/Discovery';

class LocationHypertyFactory {

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
    this.vertxInvited = false;
    this.userURL = 'user://sharing-cities-dsm/userWalletIdentity';
    console.log('token-rating-checkin', this);
    this._inviteVertx();

  }


  _inviteVertx() {
    let _this = this;

    let createMessage = {
      type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
      identity: { userProfile : { userURL: _this.userURL }},
      body: {
        from: _this.hypertyURL,
        to: 'token-rating-checkin',
        type: 'create'
      }};

    console.log('token-rating-checkin', createMessage);

    _this.bus.postMessage(createMessage,  (reply) => {
      if (reply.body.code == 200) {
        _this.vertxInvited = true;
      }
      console.log('token-rating-checkin create Reply', reply);
    });
  }

  _doCheckIN(latitude, longitude, shopID){

    let _this = this;

    let checkInData = { latitude: latitude,
                          longitude: longitude,
                          userID: _this.userURL,
                          shopID: shopID
    };

    let checkInMessage = {
      type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: _this.hypertyURL,
      identity: { userProfile : { userURL: _this.userURL }},
      body: {
        from: _this.hypertyURL,
        to: _this.userURL,
        type: 'create',
        data: checkInData
      }};

      _this.bus.postMessage(checkInMessage,  (reply) => {

        console.log('token-rating-checkin Reply-checkin', reply);
      });

  }

/*
  getCurrentPosition() {

    return new Promise((resolve) => {
      this.syncher.create(this.objectDescURL, [], position(), true, false, 'location', {}, {resources: ['location-context']})
        .then((reporter)=>{
          console.log('reporter created', reporter);
          reporter.onSubscription((event)=>event.accept());
          this.search.myIdentity().then(identity => {
            navigator.geolocation.watchPosition((position)=>{

              let idtoken =  'citizen';
              let type = 'newstream';
              let resources = 'kwh';
              let url = 'school://sharing-cities-dsm/stream/announcements';
              let announcementMessage = {
                type: 'forward', to: 'hyperty://sharing-cities-dsm/location-url', from: this.hypertyURL,
                body: {
                  idtoken: idtoken,
                  events: [{
                    type: type,
                    resources: [resources],
                    url: reporter._url }],
                  from: this.hypertyURL
                }};

              console.log('WHATISGOINGON! hyperty', announcementMessage);
              this.bus.postMessage(announcementMessage);


              resolve(position);
              console.log('[LocationReporter] my position: ', position);
              this.currentPosition = position;
              reporter.data.values = [
                { name: 'latitude', unit: 'lat', value: position.coords.latitude},
                { name: 'longitude', unit: 'lon', value: position.coords.longitude }
              ];
              reporter.data.time = position.timestamp;
              reporter.data.tag = identity.preferred_username;
            });
          });
        }).catch((error)=>{ console.log(error, 'error creating'); });

    });

  }*/

}

export default function activate(hypertyURL, bus, config) {
  return {
    name: 'LocationReporterDSM',
    instance: new LocationHypertyFactory(hypertyURL, bus, config)
  };
}
