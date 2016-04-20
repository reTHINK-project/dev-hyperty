import React from 'react'
import ChatListed from './chat-listed'
import NewChatButton from './new-chat-button'

const ChatList = (props) => {
    return (
        <ul className="list-group">
            <li className="list-group-item">
                <ChatListed />
                <NewChatButton />
            </li>                    
        </ul>
    )
}

export default ChatList