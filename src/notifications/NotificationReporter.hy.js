import HypertyDiscovery from 'service-framework/dist/HypertyDiscovery'
import URI from 'urijs'
import { Syncher} from 'service-framework/dist/Syncher'
import NotificationsTrigger from './notifications-trigger'

let NotificationReporter = {
    send(identities, notification) {
        this.notifications.trigger(identities, notification)
    }
}

let NotificationReporterFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let hypertyDiscovery = new HypertyDiscovery(hypertyURL, bus)
    let syncher = new Syncher(hypertyURL, bus, config);
    let notifications = NotificationsTrigger(uri.hostname(), syncher, hypertyDiscovery)
    return Object.assign(Object.create(NotificationReporter), {
            hypertyURL: hypertyURL,
            notifications: notifications
        })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'NotificationReporter',
        instance: NotificationReporterFactory(hypertyURL, bus, config)
    }
}
