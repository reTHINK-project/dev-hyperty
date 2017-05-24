import GroupChatMessage from './GroupChatMessage'

const GroupChat = {

    sendMessage(message, distance){
        return this.addChild(message)
            .then((child)=>{
                this.messages.push(GroupChatMessage(child.data, true, this.identity))
                return this.messages[this.messages.length-1]
            })
    },

    onMessage(callback){
        this.onAddChild((message, identity)=>this._processTextMessages(message, identity, callback))
    },

    _processTextMessages(message, identity, callback){
        this.messages.push(GroupChatMessage(message, false, identity.userProfile))
        callback(this.messages[this.messages.length-1])
    },

    getContext(){
        return this.messages[this.messages.length-1]?this.messages[this.messages.length-1].text:'' 
    }
}

export default function(id, addChild, onAddChild, name, {startingTime, participants }, identity){
    let initialData = {
        id: id,
        name: name,
        startingTime: startingTime,
        messages:[],
        participants: participants,
        identity: identity,
        addChild: addChild,
        onAddChild: onAddChild,
        receiveBuffer: [],
        receivedSize: 0
    }

    return Object.assign(Object.create(GroupChat), initialData)
}
