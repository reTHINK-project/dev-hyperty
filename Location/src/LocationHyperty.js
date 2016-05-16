import Syncher from 'service-framework/src/syncher/Syncher'
import URI from 'urijs'
import position from './position'

const LocationHyperty = {
    getCurrentPosition(){
        return new Promise((resolve, reject)=>navigator.geolocation.getCurrentPosition((position=>resolve(position))))
    },

    startPositionBroadcast(subscribers){
        this._syncher.create(this._objectDescURL, subscribers, position)
            .then((reporter)=>{
                reporter.onSubscription((event)=>event.accept())
                navigator.geolocation.watchPosition((position)=>{
                    reporter.data.value.coords=position.coords
                    reporter.data.value.timestamp = position.timestamp
                })
            })
    }
}

const LocationHypertyFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    LocationHyperty._objectDescURL = `hyperty-catalogue://${uri.hostname()}/.well-known/dataschemas/ContextDataSchema`
    LocationHyperty._syncher = new Syncher(hypertyURL, bus, config)

    return LocationHyperty
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'Location Hyperty',
        instance: LocationHypertyFactory(hypertyURL, bus, config)
    }
}
