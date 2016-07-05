import GroupChatMessage from './GroupChatMessage'

const GroupChat = {
    sendMessage(message, distance){
        return this._dataObject.addChild('chatmessages', {message: message, distance: distance, position: this.position, startingTime:Date.now()})
            .then((child)=>{
                console.log('message sended', child)
                this.messages.push(GroupChatMessage(child, true, this.identity))
                return this.messages[this.messages.length-1]
            })
    },

    onMessage(callback){
        this._dataObject.onAddChild((child)=>{
            console.log('message received',child)
            let childData = child.data?child.data:child.value

            if(childData.distance && this._distance(this._mapPosition(this.position.values), 
                        this._mapPosition(childData.position.values), 'K')> childData.distance)
                return
            this.messages.push(GroupChatMessage(child, false, child.identity.userProfile))
            callback(this.messages[this.messages.length-1])
        })
    },

    getContext(){
        return this.messages[this.messages.length-1]?this.messages[this.messages.length-1].text:'' 
    },

    _mapPosition(values){
        let position = {}
        
        values.forEach((value)=>position[value.name]=value.value)
        return position
    },

    _distance(origin, destination, unit) {
        var radlat1 = Math.PI * origin.latitude/180
        var radlat2 = Math.PI * destination.latitude/180
        var theta = origin.longitude-destination.longitude
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        if (unit=="K") { dist = dist * 1.609344 }
        if (unit=="N") { dist = dist * 0.8684 }
        return dist
    }
}

export default function(dataObject, position, identity){
    return Object.assign(Object.create(GroupChat), {
        id: dataObject.url,
        _dataObject: dataObject,
        name: dataObject.data.name,
        startingTime: dataObject.data.startingTime,
        messages:[],
        position: position,
        participants: dataObject.data.participants,
        identity: identity
    })
}
