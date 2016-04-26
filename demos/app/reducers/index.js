const chatApp = (state={chats:[], participants:[]}, action) => {
    if(action.type === 'CHAT_CREATED'){
        state.chats = state.chats.concat([action.data])

        return { ...state }
    }
    return state
}

export default chatApp
