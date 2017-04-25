import { Syncher } from 'service-framework/dist/Syncher'
import Discovery from 'service-framework/dist/Discovery';
import URI from 'urijs'
import position from './position'

const LocationObserverHyperty = (descURL, syncher, discovery) => {
    let getUsersPosition = () =>{
        return new Promise(resolve=>
        {
            setTimeout(()=>{
                resolve([])
            }, 1000)
        })
    }

    discovery.discoverDataObjectsPerName('location', ['context'], ['location'])
        .then((h) => {
            console.log('[DiscoveryHyperty]', h)
        }).catch((err)=>{
            console.error('[DiscoveryHyperty]', err)
        })

    return { getUsersPosition }
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
