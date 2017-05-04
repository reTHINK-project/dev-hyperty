import Discovery from 'service-framework/dist/Discovery'
import IdentityManager from 'service-framework/dist/IdentityManager'
import URI from 'urijs'
import { Syncher } from 'service-framework/dist/Syncher'
import GroupChat from './GroupChat' 
//import NotificationsTrigger from '../notifications/notifications-trigger'
import buildComm from './communication'

let GroupChatHyperty = {
    _getHyFor (participants){
        return Promise.all(participants.map((p) => {
            console.log('participanrt', p)
            return this.hypertyDiscoveryService.discoverHyperties(p.email, this.scheme, this.resources, p.domain)
                .then((hyperties)=>{
                    let target = hyperties
                        .sort((a,b)=>(new Date(hyperties[a].lastModified)<new Date(hyperties[b].lastModified))?1:-1)
                        .shift()

                    if(!target)
                        throw new Error('Chat Hyperty not found', p)

                    return target.hypertyID
                })
        }))
    },

    _addChild (dataObject){
        return (message)=>dataObject.addChild('chatmessages', message)
    },

    _onAddChild(dataObject){
        return (callback)=>{dataObject.onAddChild((child)=>callback(child.data || child.value, child.identity))} 
    },

    create (name, participants) {
        console.log('createGC', participants)
        return this._getHyFor(participants)
            .then(hyperties => {
                let hys = {}
                hyperties.forEach(h=>hys[h] = {})
                hys[this.hypertyURL] = {}

                return this.syncher.create(this.objectDescURL, hyperties, buildComm(name, this.hypertyURL, hys))
            }).then((dataObjectReporter) => {
                dataObjectReporter.onSubscription((event)=>{
                    //console.log('antes', event)
                    //dataObjectReporter.data.participants[event.reporter].identity = event.identity
                    //console.log('despues', dataObjectReporter)
                    event.accept()
                })
                return this.identityManagerService.discoverUserRegistered()
                    .then(identity=>GroupChat(dataObjectReporter.url, this._addChild(dataObjectReporter),
                                this._onAddChild(dataObjectReporter), 
                                dataObjectReporter.data, this._position.data, identity))
            }).catch((err)=>console.error('[GROUPCHAT]', err))
    },

    onInvite (callback) {
        this.syncher.onNotification((event) =>{
            if(event.schema.endsWith(this.locationDS)){
                this.syncher.subscribe(this.locationDescURL, event.url)
                    .then((dataObject) => {
                        this._position = dataObject
                    })
            }else if(event.schema.endsWith(this.groupChatDS) && event.value.resources[0]==='chat'){
                this.syncher.subscribe(this.objectDescURL, event.url)
                    .then((dataObject) => {
                        return this.identityManagerService.discoverUserRegistered()
                            .then(identity=>{
                                //this.notifications.trigger([{email: identity.username, domain: this.domain}], 
                                //        {type: 'NEW_CHAT', payload:{id: dataObject.url, name: dataObject.data.name}})
                                callback(GroupChat(dataObject.url, this._addChild(dataObject), this._onAddChild(dataObject), 
                                            dataObject.data, this._position.data, identity))
                            })
                    })
            }
        })
    }
}

let groupChatFactory = function(hypertyURL, bus, config){
    let uri = new URI(hypertyURL)
    let syncher = new Syncher(hypertyURL, bus, config)
    let hypertyDiscovery = new Discovery(hypertyURL, config.runtimeURL, bus)
    let identityManager = new IdentityManager(hypertyURL, config.runtimeURL, bus)
    //let notifications = NotificationsTrigger(uri.hostname(), syncher, hypertyDiscovery)
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
        //notifications: notifications,
        domain: uri.hostname(),
        groupChatDS: groupChatDS,
        locationDS: locationDS,
        scheme: ['comm'],
        resources: ['chat']
    })
}

export default function activate(hypertyURL, bus, config){
    return {
        name: 'GroupChat',
        instance: groupChatFactory(hypertyURL, bus, config)
    }
}
