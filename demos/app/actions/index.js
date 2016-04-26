const groupChatHyperty = (domain) => `hyperty-catalogue://${domain}/.well-known/hyperty/GroupChatHyperty`

function chatCreated(dataObject){
    return {
        type: 'CHAT_CREATED',
        data: dataObject
    }
}

export function createChat(runtime, domain, name, participants){
    return function(dispatch){
        runtime.requireHyperty(groupChatHyperty(domain))
            .then((hyperty)=>{
                hyperty.instance.create(name, participants)
                    .then((dataObject) => {
                        dataObject.onSubscription((event)=>event.accept())
                        dispatch(chatCreated(dataObject))
                    })
            })
        }
}

export function subscribeNewChat(runtime, domain){
    return function(dispatch){
        runtime.requireHyperty(`hyperty-catalogue://${domain}/.well-known/hyperty/GroupChatHyperty`)
            .then((hyperty)=>{
                hyperty.instance.onInvite((chat)=>dispatch(chatCreated(chat)))
            })
        }
}
