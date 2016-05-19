import HypertyDiscovery from 'service-framework/dist/HypertyDiscovery'
import URI from 'urijs'
import { Syncher } from 'service-framework/dist/Syncher'
import GroupChat from './GroupChat' 

class Communication {
    constructor(name){
        this.startingTime = Date.now()
        this.lastModified = Date.now()
        this.status = "pending"
        this.resources = []
        this.children = []
        this.name = name
    }
}

let GroupChatHyperty = {
    _getHyFor (participants){
        return Promise.all(participants.map((p) => {
            return this.hypertyDiscoveryService.discoverHypertiesPerUser(p.email, p.domain)
                .then((hyperties)=>{
                    return Object.keys(hyperties)
                        .map((key)=>{return {key:key, descriptor:hyperties[key].descriptor, lastModified:hyperties[key].lastModified}})
                        .filter((desc)=>desc.descriptor.endsWith('GroupChat'))
                        .sort((a,b)=>(new Date(a.lastModified)<new Date(b.lastModified))?1:-1)
                        .shift().key
                })
        }))
    },

    _createSyncher (name, hyperties){
        return this.syncher.create(this.objectDescURL, hyperties, new Communication(name))
    },

    create (name, participants) {
        return this._getHyFor(participants)
            .then((hyperties)=>this._createSyncher(name, hyperties))
            .then((dataObjectReporter) => {
                dataObjectReporter.onSubscription((event)=>event.accept())
                return GroupChat(dataObjectReporter, this._position.data)
            })
    },

    onInvite (callback) {
        return this.syncher.onNotification((event) =>{
            if(event.schema === this.locationDescURL){
                this.syncher.subscribe(this.locationDescURL, event.url)
                    .then((dataObject) => {
                        this._position = dataObject
                    })
            }else if(event.schema === this.objectDescURL){
                this.syncher.subscribe(this.objectDescURL, event.url)
                    .then((dataObject) => {
                        return callback(GroupChat(dataObject, this._position.data))
                    })
            }
        })
    }
}

let groupChatFactory = function(hypertyURL, bus, config){
    let syncher = new Syncher(hypertyURL, bus, config);
    let hypertyDiscovery = new HypertyDiscovery(hypertyURL, bus)
    let uri = new URI(hypertyURL)
    
    return Object.assign(Object.create(GroupChatHyperty), {
            '_position': {data:{value:{coords:{}}}},
            'syncher': syncher,
            'hypertyDiscoveryService': hypertyDiscovery,
            'objectDescURL': 'hyperty-catalogue://' + uri.hostname() + '/.well-known/dataschemas/Communication',
            'locationDescURL': 'hyperty-catalogue://' + uri.hostname() + '/.well-known/dataschemas/ContextDataSchema'
        })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'GroupChat',
        instance: groupChatFactory(hypertyURL, bus, config)
    }
}
