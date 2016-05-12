import Syncher from 'service-framework/src/syncher/Syncher'

const FakeLocationObserverHyperty = {
    receivedPosition: false,

    position: undefined
}

const FakeLoacationFactory = function(hypertyURL, bus, configuration){
    let objectDescURL = 'hyperty-catalogue://localhost/.well-known/dataschemas/LocationDataSchema'
    let syncher = new Syncher(hypertyURL, bus, configuration)

    syncher.onNotification((event)=>{
        event.ack()
        syncher.subscribe(objectDescURL, event.url)
            .then((observer)=>{
                observer.onChange('*', function(event){
                    FakeLocationObserverHyperty.receivedPosition = true
                    FakeLocationObserverHyperty.position = event.data.geoposition
                })
            })
    })

    return FakeLocationObserverHyperty
}

export default function activate(hypertyURL, bus, configuration){
    return {
        name:'Fake location observer',
        instance: FakeLoacationFactory(hypertyURL, bus, configuration)
    }
}
