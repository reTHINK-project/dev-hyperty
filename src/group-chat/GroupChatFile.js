const GroupChatFile= {
    elapsedMinutes(){
        return Math.round((((Date.now()-this.startingTime) % 86400000) % 3600000) / 60000)
    }
}

export default function({ file, startingTime }, isMe, identity){
    return Object.assign(Object.create(GroupChatFile),{
        isMe: isMe,
        file:file,
        startingTime: startingTime,
        identity: identity
    })
}
