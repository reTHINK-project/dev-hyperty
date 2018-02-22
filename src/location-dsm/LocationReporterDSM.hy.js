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

  }

  getCurrentPosition() {

    return new Promise((resolve) => {
      this.syncher.create(this.objectDescURL, [], position(), true, false, 'location', {}, {resources: ['location-context']})
        .then((reporter)=>{
          console.log('reporter created', reporter);
          reporter.onSubscription((event)=>event.accept());
          this.search.myIdentity().then(identity => {
            navigator.geolocation.watchPosition((position)=>{

              // send announcement message
              /*
              {
              idtoken: "jhhhgjg",
              [
              {"type": 'newstream',"resources": [<resource-type>], url: <stream address> },
              {"type": 'newsetting',"key": <setting-name>, "value": <setting-vale> }, ]
            }
            */
              /*
           idtoken - should include the required id to validate the citizen id. It should be compliant with OIDC.
          type  - identifies the type of announcement including newstream and newsetting
          resources - identifies the type of resources to be produced in the stream eg location-context . See here
          url - the stream address
          key -  name of attribute eg cause-name
          value -  value of attribute eg School-A
            */
              let idtoken =  'citizen';
              let type = 'newstream';
              let resources = 'kwh';
              let url = 'school://vertx-app/stream/announcements';
              let announcementMessage = {
                id: '123', type: 'create', to: 'school://vertx-app/announcement', from: this.hypertyURL,
                body: {
                  idtoken: idtoken,
                  events: [{
                    type: 'type',
                    resources: [resources],
                    url: url
                  }]
                }};
              console.log('DSM - sending message to protostub');
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

  }

}

export default function activate(hypertyURL, bus, config) {
  return {
    name: 'LocationReporterDSM',
    instance: new LocationHypertyFactory(hypertyURL, bus, config)
  };
}
