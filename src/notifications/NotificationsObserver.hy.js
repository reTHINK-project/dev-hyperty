import URI from 'urijs'
import { Syncher} from 'service-framework/dist/Syncher'

let NotificationsObserver = {
    onNotification (callback) {
        this.syncher.onNotification((event) =>{
            if(event.schema === this.objectDescURL && event.value.resources[0]==='notification'){
                this.syncher.subscribe(this.objectDescURL, event.url)
                    .then((dataObject) => {
                        console.log('notification received', dataObject)
                        dataObject.onAddChild((child)=>{
                            console.log('message received',child)
                            let childData = child.data?child.data:child.value
                            childData.from = child.identity.userProfile

                            this.notifications.push(childData)
                            callback(this.notifications[this.notifications.length-1])
                        })
                    })
            }
        })
    }
}

let NotificationsObserverFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let syncher = new Syncher(hypertyURL, bus, config);
    return Object.assign(Object.create(NotificationsObserver), {
            'syncher': syncher,
            'objectDescURL': 'hyperty-catalogue://catalogue.' + uri.hostname() + '/.well-known/dataschema/Communication',
            'hypertyURL': hypertyURL,
            notifications: []
        })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'NotificationsObserver',
        instance: NotificationsObserverFactory(hypertyURL, bus, config)
    }
}
