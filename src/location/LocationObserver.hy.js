//import { Syncher } from 'service-framework/dist/Syncher';
//import {Discovery} from 'service-framework/dist/Discovery';
//import URI from 'urijs'
//import {ContextObserver} from 'service-framework/dist/ContextManager';


class LocationObserverHyperty {

  constructor(hypertyURL, bus, config, factory) {
    //    this._domain = divideURL(hypertyURL).domain;
    
    this._context = factory.createContextObserver(hypertyURL, bus, config,['location-context']);

    /*    let uri = new URI(hypertyURL);
        this._users2observe = [];
        this._observers = {};
        this._objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`;
        this._syncher = new Syncher(hypertyURL, bus, config);
        this._discovery = new Discovery(hypertyURL, config.runtimeURL, bus);*/


  }

  start(callback) {
    console.log('[LocationObserver.start] ');
    return this._context.start();
  }

  resumeDiscoveries() {
    return this._context.resumeDiscoveries();
  }

  onResumeObserver(callback) {
    return this._context.onResumeObserver(callback);
  }

  discoverUsers(email,domain) {
    return this._context.discoverUsers(email, domain);
  }

  observe(hyperty) {
    return this._context.observe(hyperty);
  }

  unobserve(Context)
  {
    return this._context.unobserve(Context);
  }



/*watchUsersPosition(callback) {
    this.usersPosition = [];

    this._discovery.discoverDataObjectsPerName('location')
        .then((dataobjects) => {
            const liveDOs = dataobjects.filter(d => d.status === 'live')
            console.log('[LocationObserver] disocvered', liveDOs)
            liveDOs.forEach(dataobject =>  {
                this._syncher.subscribe(this._objectDescURL, dataobject.url).then(observer => {
                    console.log('[LocationObserver] observing', observer)
                    //observer.data.values[]
                    //preferred_username
                    let position = {
                        preferred_username: observer.data.tag,
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
                            this.usersPosition.push(position);
                        }
                        if(callback)
                            callback(this.usersPosition)
                    })
                    if(callback)
                        callback(this.usersPosition)
                })
            })
        }).catch((err)=>{
            console.error('[LocationObserver]', err)
        });
}*/

}

export default function activate(hypertyURL, bus, config, factory){

    return {
        name: 'LocationObserver',
        instance: new LocationObserverHyperty(hypertyURL, bus, config, factory)
    };
}
