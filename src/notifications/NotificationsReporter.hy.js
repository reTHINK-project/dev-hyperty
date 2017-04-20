import HypertyDiscovery from 'service-framework/dist/Discovery'
import URI from 'urijs'
import { Syncher} from 'service-framework/dist/Syncher'
import NotificationsTrigger from './notifications-trigger'

let NotificationsReporter = {
    send(identities, notification) {
        this.notifications.trigger(identities, notification)
    }
}

let NotificationsReporterFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let hypertyDiscovery = new HypertyDiscovery(hypertyURL, undefined, bus)
    let syncher = new Syncher(hypertyURL, bus, config);
    let notifications = NotificationsTrigger(uri.hostname(), syncher, hypertyDiscovery)
    return Object.assign(Object.create(NotificationsReporter), {
            hypertyURL: hypertyURL,
            notifications: notifications
        })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'NotificationsReporter',
        instance: NotificationsReporterFactory(hypertyURL, bus, config)
    }
}
