import { Syncher } from 'service-framework/dist/Syncher'
import URI from 'urijs'
import position from './position'
import Search from '../utils/Search';
import IdentityManager from 'service-framework/dist/IdentityManager';
import Discovery from 'service-framework/dist/Discovery';

const LocationHyperty = {
    getCurrentPosition(){
        return new Promise((resolve, reject)=>navigator.geolocation.getCurrentPosition((position=>resolve(position))))
    }
}

const LocationHypertyFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`
    let syncher = new Syncher(hypertyURL, bus, config)
    let identityManager = new IdentityManager(hypertyURL, config.runtimeURL, bus);
    let discovery = new Discovery(hypertyURL, config.runtimeURL, bus);
    let search = new Search(discovery, identityManager)

    syncher.create(objectDescURL, [], position())
        .then((reporter)=>{
            reporter.onSubscription((event)=>event.accept())
            navigator.geolocation.watchPosition((position)=>{
                search.myIdentity().then(identity => {
                    reporter.data.values = [
                        { name: 'latitude', unit: 'lat', value: position.coords.latitude},
                        { name: 'longitude', unit: 'lon', value: position.coords.longitude }
                    ]
                    reporter.data.time = position.timestamp
                    reporter.data.tag = identity.username
                })
            })
        })

    return LocationHyperty
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'LocationReporter',
        instance: LocationHypertyFactory(hypertyURL, bus, config)
    }
}
