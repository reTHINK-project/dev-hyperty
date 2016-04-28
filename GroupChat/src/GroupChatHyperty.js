import HypertyDiscovery from 'service-framework/src/hyperty-discovery/HypertyDiscovery'
import URI from 'urijs'
import Syncher from 'service-framework/src/syncher/Syncher'
import SyncObject from 'service-framework/src/syncher/SyncObject'

let GroupChat = {
    _getHyFor (participants){
        return Promise.all(participants.map((p) => {
            return this.hypertyDiscoveryService.discoverHypertyPerUser(p.email, p.domain)
                .then((user)=>user.hypertyURL)
        }))
    },

    _createSyncher (hyperties){
        return this.syncher.create(this.objectDescURL, hyperties, {})
    },

    create (name, participants) {
        return this._getHyFor(participants)
            .then((hyperties)=>this._createSyncher(hyperties))
    },

    onInvite (callback) {
        console.log("juas")
        return this.syncher.onNotification((event) =>{
            this.syncher.subscribe(this.objectDescURL, event.url)
                .then((dataObject) => {
                    return callback(dataObject)
                })
        })
    }
}

let groupChatFactory = function(hypertyURL, bus, config){
    let syncher = new Syncher(hypertyURL, bus, config);
    let hypertyDiscovery = new HypertyDiscovery(hypertyURL, bus)
    let uri = new URI(hypertyURL)

    return Object.assign(Object.create(GroupChat), {

            'syncher': syncher,
            'hypertyDiscoveryService': hypertyDiscovery,
            'objectDescURL': 'hyperty-catalogue://' + uri.hostname() + '/.well-known/dataschemas/CommunicationDataSchema'
        })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'Group Chat Hyperty',
        instance: groupChatFactory(hypertyURL, bus, config)
    }
}
