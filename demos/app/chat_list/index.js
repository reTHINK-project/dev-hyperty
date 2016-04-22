import React from 'react'
import ChatListed from './chat-listed'
import NewChatButton from './new-chat-button'

const ChatList = React.createClass({
    componentWillMount(){
        this.props.runtime.requireHyperty('hyperty-catalogue://localhost:6443/.well-known/hyperty/GroupChatHyperty')
            .then((hyperty)=>{
                this.setState({chatHyperty: hyperty})
            })
    },

    render(){
        return (
            <ul className="list-group">
                <li className="list-group-item">
                    <ChatListed />
                    <NewChatButton />
                </li>                    
            </ul>
        )
    }
})

export default ChatList
