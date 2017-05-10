import Discovery from 'service-framework/dist/Discovery'
import IdentityManager from 'service-framework/dist/IdentityManager'
import URI from 'urijs'
import { Syncher } from 'service-framework/dist/Syncher'
import GroupChat from './GroupChat' 
import buildComm from './communication'

let GroupChatHyperty = {
    _getHyFor (participants){
        return Promise.all(participants.map((p) => {
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
        let seq = 0
        return (message)=>{
            seq+=1
            let Message = {
                url : dataObject.data.url,
                cseq : seq,
                reporter : dataObject.data.reporter,
                schema : dataObject.data.schema,
                name : dataObject.data.name,
                created : new Date().toJSON(),
                type : "chat",
                content : message
            }
            return dataObject.addChild('resources', Message)
        }
    },

    _onAddChild(dataObject){
        return (callback)=>{console.log('onaddchildddd');dataObject.onAddChild((child)=>callback(child.data || child.value, child.identity))} 
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
                                dataObjectReporter.data, identity))
            }).catch((err)=>console.error('[GROUPCHAT]', err))
    },

    onInvite (callback) {
        this.syncher.onNotification((event) =>{
            if(event.schema.endsWith(this.groupChatDS) && event.value.resources[0]==='chat'){
                this.syncher.subscribe(this.objectDescURL, event.url)
                    .then((dataObject) => {
                        return this.identityManagerService.discoverUserRegistered()
                            .then(identity=>{
                                callback(GroupChat(dataObject.url, this._addChild(dataObject), this._onAddChild(dataObject), 
                                            dataObject.data, identity))
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
    let groupChatDS = 'Communication'

    return Object.assign(Object.create(GroupChatHyperty), {
        syncher: syncher,
        hypertyDiscoveryService: hypertyDiscovery,
        identityManagerService: identityManager,
        objectDescURL:`hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/${groupChatDS}`,
        hypertyURL: hypertyURL,
        domain: uri.hostname(),
        groupChatDS: groupChatDS,
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
