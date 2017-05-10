import { Syncher } from 'service-framework/dist/Syncher'
import Discovery from 'service-framework/dist/Discovery';
import URI from 'urijs'

const LocationObserverHyperty = (descURL, syncher, discovery, users_position=[], callback) => {
    let getUsersPosition = () => users_position
    let watchUsersPosition = (c) => {
        callback = c
        callback(users_position)
    }

    discovery.discoverDataObjectsPerName('location')
        .then((dataobjects) => {
            console.log('[DiscoveryHyperty]', dataobjects)
            dataobjects.forEach(dataobject =>  {
                syncher.subscribe(descURL, dataobject.url).then(observer=>{
                    console.log('location ob', observer)
                    //observer.data.values[]
                    //username
                    let position = {
                        username: observer.data.tag,
                        coords:{
                            latitude: observer.data.values.find(v=>v.name==='latitude').value,
                            longitude: observer.data.values.find(v=>v.name==='longitude').value
                        }
                    }
                    users_position.push(position)
                    observer.onChange('*', (event)=>{
                        if(event.field === 'values'){
                            position.coords.latitude = event.data.find(v=>v.name==='latitude').value
                            position.coords.longitude = event.data.find(v=>v.name==='longitude').value
                        }
                        if(callback)
                            callback(users_position)
                    })
                    if(callback)
                        callback(users_position)
                })
            })
        }).catch((err)=>{
            console.error('[DiscoveryHyperty]', err)
        })

    return { getUsersPosition, watchUsersPosition }
}

export default function activate(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let _objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`
    let _syncher = new Syncher(hypertyURL, bus, config)
    let _discovery = new Discovery(hypertyURL, config.runtimeURL, bus) //TODO

    return {
        name: 'LocationObserver',
        instance: LocationObserverHyperty(_objectDescURL, _syncher, _discovery)
    }
}
