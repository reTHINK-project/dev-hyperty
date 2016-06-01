const GroupChatMessage = {}

export default function(dataObjectChild, isMe){
    return Object.assign(Object.create(GroupChatMessage),{
        _dataObjectChild: dataObjectChild,
        isMe: isMe,
        text: dataObjectChild.data?dataObjectChild.data.chatMessage:dataObjectChild.value.chatMessage,
        startingTime: dataObjectChild.data?dataObjectChild.data.startingTime:dataObjectChild.value.startingTime
    })
}
