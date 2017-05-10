const NotificationsTriggerObject = {
    _getHyFor(profiles){
        return Promise.all(profiles.map((p) => {
            console.log('notify profile', p)
            //let user = p.userURL.substring(p.userURL.lastIndexOf('/')+1, p.userURL.length)
            //console.log(user)
            //let path = `user://${user.split('@')[1]}/${user.split('@')[0]}`
            //console.log(path)
            return this._discoveryService.discoverHyperty(p.userURL)
                .then((hyperties)=>{
                    return Object.keys(hyperties)
                        .map((key)=>{return {key:key, descriptor:hyperties[key].descriptor, lastModified:hyperties[key].lastModified}})
                        .filter((desc)=>desc.descriptor.endsWith('NotificationsObserver'))
                        .sort((a,b)=>(new Date(a.lastModified)<new Date(b.lastModified))?1:-1)
                        .shift().key
                })
        }))
    },

    trigger(recipients, notification){
        return this._getHyFor(recipients)
            .then((hypertyURLs)=>{
                return this._syncher.create(this._objectDescURL, hypertyURLs, {
                    name: 'NotificationReporter',
                    resources: ['notification'],
                    children: [],
                    status: 'open',
                    participants: hypertyURLs
                }).then((reporter)=>{
                        reporter.onSubscription((event)=>event.accept())
                        setTimeout(()=>{
                        return reporter.addChild('chatmessages', notification)
                            .then((child)=>{
                                console.log('notification sended', notification)
                                return child
                            })
                        }, 2000)
                    })
            })
    }
}

const NotificationsTrigger = (domain, syncher, discoveryService)=>{
    return Object.assign({
            _syncher: syncher,

            _discoveryService: discoveryService,

            _objectDescURL:`hyperty-catalogue://catalogue.${domain}/.well-known/dataschema/Communication`,
        }, NotificationsTriggerObject)
}

export default NotificationsTrigger
