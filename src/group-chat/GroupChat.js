import GroupChatMessage from './GroupChatMessage'
import GroupChatFile from './GroupChatFile'
import { Position, Area } from './gps'
import { SendData, addSendDataIfSupported } from './send-data'

const GroupChat = {

    sendMessage(message, distance){
        return this.addChild({ type: 'TEXT', message: message, distance: distance, position: this.position, startingTime:Date.now()})
            .then((child)=>{
                this.messages.push(GroupChatMessage(child.data, true, this.identity))
                return this.messages[this.messages.length-1]
            })
    },

    onMessage(callback){
        this.onAddChild((message, identity)=>this._processTextMessages(message, identity, callback))
    },

    _processTextMessages(message, identity, callback){
        if(message.type != 'TEXT')
            return

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

    let chat = Object.assign(Object.create(GroupChat), initialData)
	chat = addSendDataIfSupported(chat)

    return chat
}
