import { Syncher } from 'service-framework/dist/Syncher'
import URI from 'urijs'
import position from './position'

const LocationHyperty = {
    getCurrentPosition(){
        return new Promise((resolve, reject)=>navigator.geolocation.getCurrentPosition((position=>resolve(position))))
    },

    startPositionBroadcast(subscribers){
        this._syncher.create(this._objectDescURL, subscribers, position())
            .then((reporter)=>{
                reporter.onSubscription((event)=>event.accept())
                navigator.geolocation.watchPosition((position)=>{
                    reporter.data.values = [
                        { name: 'latitude', unit: 'lat', value: position.coords.latitude},
                        { name: 'longitude', unit: 'lon', value: position.coords.longitude }
                    ]
                    reporter.data.time = position.timestamp
                })
            })
    }
}

const LocationHypertyFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    LocationHyperty._objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`
    LocationHyperty._syncher = new Syncher(hypertyURL, bus, config)

    return LocationHyperty
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'Location',
        instance: LocationHypertyFactory(hypertyURL, bus, config)
    }
}
