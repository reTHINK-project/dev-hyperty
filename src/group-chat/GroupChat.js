import GroupChatMessage from './GroupChatMessage'
import { Position, Area } from './gps'

const GroupChat = {

    sendMessage(message, distance){
        return this.addChild({ message: message, distance: distance, position: this.position, startingTime:Date.now()})
            .then((child)=>{
                this.messages.push(GroupChatMessage(child.data, true, this.identity))
                return this.messages[this.messages.length-1]
            })
    },

    onMessage(callback){
        this.onAddChild((message, identity)=>this._processTextMessages(message, identity, callback))
    },

    _processTextMessages(message, identity, callback){
        let myPosition = Position(this.position)
        let area = Area(message.position, message.distance) 

        if(!myPosition.isIn(area))
            return

        this.messages.push(GroupChatMessage(message, false, identity.userProfile))
        callback(this.messages[this.messages.length-1])
    },

    getContext(){
        return this.messages[this.messages.length-1]?this.messages[this.messages.length-1].text:'' 
    }
}

export default function(id, addChild, onAddChild, { name, startingTime, participants }, position, identity){
    let initialData = {
        id: id,
        name: name,
        startingTime: startingTime,
        messages:[],
        position: position,
        participants: participants,
        identity: identity,
        addChild: addChild,
        onAddChild: onAddChild,
        receiveBuffer: [],
        receivedSize: 0
    }

    return Object.assign(Object.create(GroupChat), initialData)
}
