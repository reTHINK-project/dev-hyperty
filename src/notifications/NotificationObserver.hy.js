import URI from 'urijs'
import { Syncher} from 'service-framework/dist/Syncher'

let NotificationObserver = {
    onNotification (callback) {
        this.syncher.onNotification((event) =>{
            if(event.schema === this.objectDescURL){
                this.syncher.subscribe(this.objectDescURL, event.url)
                    .then((dataObject) => {
                        console.log('notification received', dataObject)
                        dataObject.onAddChild((child)=>{
                            console.log('message received',child)
                            let childData = child.data?child.data:child.value

                            this.notifications.push(childData)
                            callback(this.notifications[this.notifications.length-1])
                        })
                    })
            }
        })
    }
}

let NotificationObserverFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let syncher = new Syncher(hypertyURL, bus, config);
    return Object.assign(Object.create(NotificationObserver), {
            'syncher': syncher,
            'objectDescURL': 'hyperty-catalogue://' + uri.hostname() + '/.well-known/dataschemas/Communication',
            'hypertyURL': hypertyURL,
            notifications: []
        })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'NotificationObserver',
        instance: NotificationObserverFactory(hypertyURL, bus, config)
    }
}
