import HypertyDiscovery from 'service-framework/dist/Discovery'
import IdentityManager from 'service-framework/dist/IdentityManager'
import URI from 'urijs'
import { Syncher } from 'service-framework/dist/Syncher'
import GroupChat from './GroupChat' 
import NotificationsTrigger from '../notifications/notifications-trigger'

class Communication {
    constructor(name, participants){
        this.startingTime = Date.now()
        this.lastModified = Date.now()
        this.status = "pending"
        this.resources = []
        this.children = []
        this.name = name
        this.participants = participants
    }
}

let GroupChatHyperty = {
    _getHyFor (participants){
        return Promise.all(participants.map((p) => {
            return this.hypertyDiscoveryService.discoverHyperty(p.email,['comm'], ['chat'], p.domain)
                .then((hyperty)=>{
                    return hyperty.key
                })
        }))
    },

    _createSyncher (name, hyperties){
        return this.syncher.create(this.objectDescURL, hyperties, new Communication(name, hyperties.concat([this.hypertyURL])))
    },

    _resolveIdentity(){
        return new Promise((resolve, reject)=>{
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

    create (name, participants) {
        let identity = undefined
        return this._resolveIdentity()
            .then((id)=>identity=id)
            .then(()=>this._getHyFor(participants))
            .then((hyperties)=>this._createSyncher(name, hyperties))
            .then((dataObjectReporter) => {
                console.log('creating group chat', dataObjectReporter)
                dataObjectReporter.onSubscription((event)=>event.accept())
                return GroupChat(dataObjectReporter, this._position.data, identity)
            })
    },

    onInvite (callback) {
        this.syncher.onNotification((event) =>{
            if(event.schema === this.locationDS){
                this.syncher.subscribe(this.locationDescURL, event.url)
                    .then((dataObject) => {
                        this._position = dataObject
                    })
            }else if(event.schema === this.groupChatDS){
                let identity = undefined
                this._resolveIdentity()
                    .then((id)=>identity=id)
                    .then(()=>this.syncher.subscribe(this.objectDescURL, event.url))
                    .then((dataObject) => {
                        console.log('creating group chat on invite', dataObject)
                        this.notifications.trigger([{email: identity.username, domain: this.domain}], 
                                {type: 'NEW_CHAT', payload:{id: dataObject.url, name: dataObject.data.name}})
                        return callback(GroupChat(dataObject, this._position.data, identity))
                    })
            }
        })
    }
}

let groupChatFactory = function(hypertyURL, bus, config){
    let syncher = new Syncher(hypertyURL, bus, config)
    let hypertyDiscovery = new HypertyDiscovery(hypertyURL, bus)
    let identityManager = new IdentityManager(hypertyURL, config.runtimeURL, bus)
    let uri = new URI(hypertyURL)
    let notifications = NotificationsTrigger(uri.hostname(), syncher, hypertyDiscovery)
    let groupChatDS = 'Communication'
    let locationDS = 'Context'
    
    return Object.assign(Object.create(GroupChatHyperty), {
        _position: {data:{values:{}}},
        syncher: syncher,
        hypertyDiscoveryService: hypertyDiscovery,
        identityManagerService: identityManager,
        objectDescURL:`hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/${groupChatDS}`,
        locationDescURL:`hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/${locationDS}`,
        hypertyURL: hypertyURL,
        notifications: notifications,
        domain: uri.hostname(),
        groupChatDS: groupChatDS,
        locationDS: locationDS
    })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'GroupChat',
        instance: groupChatFactory(hypertyURL, bus, config)
    }
}
