const GroupChatMessage = {
    elapsedMinutes(){
        return Math.round((((Date.now()-this.startingTime) % 86400000) % 3600000) / 60000)
    }
}

export default function({ message, startingTime }, isMe, identity){
    return Object.assign(Object.create(GroupChatMessage),{
        isMe: isMe,
        text: message,
        startingTime: startingTime,
        identity: identity
    })
}
