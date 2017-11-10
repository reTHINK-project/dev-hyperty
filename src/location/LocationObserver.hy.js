import { Syncher } from 'service-framework/dist/Syncher';
import {Discovery} from 'service-framework/dist/Discovery';
import URI from 'urijs'

class LocationObserverHyperty {

  constructor(hypertyURL, bus, config) {
    let uri = new URI(hypertyURL);
    this._objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`;
    this._syncher = new Syncher(hypertyURL, bus, config);
    this._discovery = new Discovery(hypertyURL, config.runtimeURL, bus);
  }

watchUsersPosition(callback) {
  this.usersPosition;
  this.watcher = callback;

    this._discovery.discoverDataObjectsPerName('location')
        .then((dataobjects) => {
            const liveDOs = dataobjects.filter(d => d.status === 'live')
            console.log('[LocationObserver] disocvered', liveDOs)
            liveDOs.forEach(dataobject =>  {
                this._syncher.subscribe(descURL, dataobject.url).then(observer=>{
                    console.log('[LocationObserver] observing', observer)
                    //observer.data.values[]
                    //username
                    let position = {
                        username: observer.data.tag,
                        coords:{
                            latitude: observer.data.values.find(v=>v.name==='latitude').value,
                            longitude: observer.data.values.find(v=>v.name==='longitude').value
                        }
                    }
                    this.users_position.push(position)
                    observer.onChange('*', (event)=>{
                        if(event.field === 'values'){
                            position.coords.latitude = event.data.find(v=>v.name==='latitude').value
                            position.coords.longitude = event.data.find(v=>v.name==='longitude').value
                        }
                        if(this.watcher)
                            this.watcher(this.users_position)
                    })
                    if(this.watcher)
                        this.watcher(this.users_position)
                })
            })
        }).catch((err)=>{
            console.error('[LocationObserver]', err)
        })
      }

}

export default function activate(hypertyURL, bus, config){

    return {
        name: 'LocationObserver',
        instance: new LocationObserverHyperty(hypertyURL, bus, config)
    };
}
