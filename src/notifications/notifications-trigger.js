const NotificationsTriggerObject = {
    _getHyFor(identities){
        return Promise.all(identities.map((p) => {
            return this._discoveryService.discoverHypertiesPerUser(p.email, p.domain)
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
                return this._syncher.create(this._objectDescURL, hypertyURLs, {})
                    .then((reporter)=>{
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

            _objectDescURL:`hyperty-catalogue://${domain}/.well-known/dataschemas/Communication`,
        }, NotificationsTriggerObject)
}

export default NotificationsTrigger
