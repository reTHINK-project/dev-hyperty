const GroupChatMessage = {
    elapsedMinutes(){
        return Math.round((((Date.now()-this.startingTime) % 86400000) % 3600000) / 60000)
    }
}

export default function(dataObjectChild, isMe, identity){
    return Object.assign(Object.create(GroupChatMessage),{
        _dataObjectChild: dataObjectChild,
        isMe: isMe,
        text: dataObjectChild.data?dataObjectChild.data.chatMessage:dataObjectChild.value.chatMessage,
        startingTime: dataObjectChild.data?dataObjectChild.data.startingTime:dataObjectChild.value.startingTime,
        identity: identity
    })
}
