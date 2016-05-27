import { Syncher } from 'service-framework/dist/Syncher'
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
                    //reporter.data.value.accuaricy = position.coords.accuaricy
                    //reporter.data.value.altitude = position.coords.altitude
                    //reporter.data.value.altitudeAccuracy = position.coords.altitudeAccuracy
                    //reporter.data.value.heading = position.coords.heading
                    reporter.data.value.latitude = position.coords.latitude
                    reporter.data.value.longitude = position.coords.longitude
                    //reporter.data.value.speed = position.coords.speed
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
        name: 'Location',
        instance: LocationHypertyFactory(hypertyURL, bus, config)
    }
}
