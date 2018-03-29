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



    let userURL = 'user://sharing-cities-dsm/userWalletIdentity';
    let createMessage = {
      type: 'forward', to: 'hyperty://sharing-cities-dsm/wallet-manager', from: this.hypertyURL,
      identity: { userProfile : { userURL: userURL }},
      body: {
        from: this.hypertyURL,
        to: 'token-rating-checkin',
        type: 'create'
      }};

    console.log('WalletDSM create message', createMessage);

    this.bus.postMessage(createMessage,  (reply) => {
      console.log('token-rating-checkin create Reply', reply);
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
