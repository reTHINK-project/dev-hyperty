import { Syncher } from 'service-framework/dist/Syncher';
import {Discovery} from 'service-framework/dist/Discovery';
import URI from 'urijs'
import ContextObserver from 'service-framework/dist/ContextManager';

class LocationObserverHyperty extends ContextObserver {

  constructor(hypertyURL, bus, config) {
//    this._domain = divideURL(hypertyURL).domain;

super(hypertyURL, bus, config,['location-context']);

/*    let uri = new URI(hypertyURL);
    this._users2observe = [];
    this._observers = {};
    this._objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`;
    this._syncher = new Syncher(hypertyURL, bus, config);
    this._discovery = new Discovery(hypertyURL, config.runtimeURL, bus);*/
  }

start(){
  console.log('[LocationObserver.start] ');
  return super.start();
}

resumeDiscoveries() {
  return super.resumeDiscoveries();
}

onResumeObserver(callback) {
  return super.onResumeObserver(callback);
}

discoverUsers(email,domain) {
  return super.discoverUsers(email,domain);
}

observe(hyperty){
  return super.observe(hyperty);
}

unobserve(Context)
  {
    return super.unobserve(Context);
  }


/*
watchUsersPosition(callback) {
  this.usersPosition = [];
  this.watcher = callback;

    this._discovery.discoverDataObjectsPerName('location')
        .then((dataobjects) => {
            const liveDOs = dataobjects.filter(d => d.status === 'live')
            console.log('[LocationObserver] disocvered', liveDOs)
            liveDOs.forEach(dataobject =>  {
                this._syncher.subscribe(this._objectDescURL, dataobject.url).then(observer=>{
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
                    this.usersPosition.push(position)
                    observer.onChange('*', (event)=>{
                        if(event.field === 'values'){
                            position.coords.latitude = event.data.find(v=>v.name==='latitude').value
                            position.coords.longitude = event.data.find(v=>v.name==='longitude').value
                        }
                        if(this.watcher)
                            this.watcher(this.usersPosition)
                    })
                    if(this.watcher)
                        this.watcher(this.usersPosition)
                })
            })
        }).catch((err)=>{
            console.error('[LocationObserver]', err)
        })
      }*/

}

export default function activate(hypertyURL, bus, config){

    return {
        name: 'LocationObserver',
        instance: new LocationObserverHyperty(hypertyURL, bus, config)
    };
}
