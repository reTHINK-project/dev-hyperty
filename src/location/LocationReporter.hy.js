import { Syncher } from 'service-framework/dist/Syncher'
import URI from 'urijs'
import position from './position'
import Search from '../utils/Search';
import IdentityManager from 'service-framework/dist/IdentityManager';
import {Discovery} from 'service-framework/dist/Discovery';

class LocationHypertyFactory {



constructor(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    this.objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`
    this.syncher = new Syncher(hypertyURL, bus, config)
    this.identityManager = new IdentityManager(hypertyURL, config.runtimeURL, bus);
    this.discovery = new Discovery(hypertyURL, config.runtimeURL, bus);
    this.search = new Search(this.discovery, this.identityManager)
    this.currentPosition
  }

  getCurrentPosition() {

    return new Promise((resolve) => {
      this.syncher.create(this.objectDescURL, [], position(), true, false, 'location', {}, {resources: ['location-context']})
        .then((reporter)=>{
            reporter.onSubscription((event)=>event.accept())
            this.search.myIdentity().then(identity => {
                navigator.geolocation.watchPosition((position)=>{
                  resolve(position);
                  console.log('[LocationReporter] my position: ', position);
                    this.currentPosition = position
                    reporter.data.values = [
                        { name: 'latitude', unit: 'lat', value: position.coords.latitude},
                        { name: 'longitude', unit: 'lon', value: position.coords.longitude }
                    ]
                    reporter.data.time = position.timestamp
                    reporter.data.tag = identity.preferred_username
                })
            })
        })

    });

      }

}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'LocationReporter',
        instance: new LocationHypertyFactory(hypertyURL, bus, config)
    }
}
