import GroupChatMessage from './GroupChatMessage'

const GroupChat = {
    sendMessage(message){
        return this._dataObject.addChildren('chatmessages', {chatMessage: message})
            .then((child)=>{
                this.messages.push(GroupChatMessage(child, true))
                return this.messages[this.messages.length-1]
            })
    },

    onMessage(callback){
        this._dataObject.onAddChildren((child)=>{
            this.messages.push(GroupChatMessage(child, false))
            callback(this.messages[this.messages.length-1])
        })
    }
}

export default function(dataObject){
    return Object.assign(Object.create(GroupChat), {
        _dataObject: dataObject,
        name: dataObject.data.name,
        startingTime: dataObject.data.startingTime,
        messages:[]
    })
}
