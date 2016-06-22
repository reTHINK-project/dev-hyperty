import IdentityManager from 'service-framework/dist/IdentityManager'
import HypertyDiscovery from 'service-framework/dist/HypertyDiscovery'
import URI from 'urijs'
import { Syncher} from 'service-framework/dist/Syncher'
import NotificationsTrigger from '../notifications/notifications-trigger'

let SurveyObserver = {
    _resolveIdentity(){
        return new Promise((resolve)=>{
            if(this.identity)
            {
                resolve(this.identity)
            }
            else
            {
                this.identityManagerService.discoverUserRegistered('.', this.hypertyURL)
                    .then((identity)=>{
                        this.identity=identity
                        resolve(identity)
                    })
            }
        })
    },

    onRequest (callback) {
        this.syncher.onNotification((event) =>{
            if(event.schema === this.objectDescURL){
                let identity
                this._resolveIdentity()
                    .then((id)=>identity=id)
                    .then(()=>this.syncher.subscribe(this.objectDescURL, event.url))
                    .then((dataObject) => {
                        console.log('trigger')
                        this.notifications.trigger([{email: identity.username, domain: this.domain}], 
                                {type: 'NEW_SURVEY', payload:{id: dataObject.url}})
                        callback({
                            answer:(answer)=>{
                                dataObject.addChild('chatmessages', {response:answer})
                            },
                            data:dataObject.data.survey
                        })
                    })
            }
        })
    }
}

let SurveyObserverFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let syncher = new Syncher(hypertyURL, bus, config)
    let hypertyDiscovery = new HypertyDiscovery(hypertyURL, bus)
    let notifications = NotificationsTrigger(uri.hostname(), syncher, hypertyDiscovery)
    let identityManager = new IdentityManager(hypertyURL, config.runtimeURL, bus)
    return Object.assign(Object.create(SurveyObserver), {
        syncher: syncher,
        objectDescURL: 'hyperty-catalogue://catalogue.' + uri.hostname() + '/.well-known/dataschema/Communication',
        hypertyURL: hypertyURL,
        notifications: notifications,
        identityManagerService: identityManager
    })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'SurveyObserver',
        instance: SurveyObserverFactory(hypertyURL, bus, config)
    }
}
