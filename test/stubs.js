export function syncherFactory (setCallback){
    let syncher = function (){} 
    syncher.prototype.onNotification = (callback)=>{ 
        setCallback(callback)
    } 
    syncher.prototype.subscribe = ()=>Promise.resolve({onAddChild:(callback)=>callback({})})
    syncher.prototype.create = ()=>Promise.resolve({onSubscription: ()=>{}, onAddChild:(callback)=>{
        setCallback(callback)
    }})

    return syncher
}

export function hypertyDiscoveryFactory (descriptor){
    let hypertyDiscovery = function (){}
    hypertyDiscovery.prototype.discoverHypertiesPerUser = () => {
        return Promise.resolve({'runtimeURL':{ descriptor: descriptor, lastModified: Date.now()}})
    }

    return hypertyDiscovery
}
