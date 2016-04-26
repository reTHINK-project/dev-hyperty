import React from 'react'
import { connect } from 'react-redux'
import { createChat } from '../../actions'
import Message from './message'

let Chat = React.createClass({
    componentWillMount(){
        let dispatch = this.props.dispatch
        dispatch(createChat(this.props.runtime, this.props.domain, 
                    this.props.location.state.name, this.props.location.state.participants))
    },

    render(){
        return(
                <div className="expando">
                <div className="panel-body">
                    <ul className="chat">
                        <Message content="juas" time={Date.now()} name="Jack Sparrow" isMe={true}/>
                        <Message content="juas" time={Date.now()} name="Jack Sparrow" isMe={false}/>
                    </ul>
                </div>
                <div className="panel-footer">
                    <div className="input-group">
                        <input id="btn-input" type="text" className="form-control input-sm" placeholder="Type your message here..."/>
                        <span className="input-group-btn">
                            <button className="btn btn-warning btn-sm" id="btn-chat">
                                Send</button>
                        </span>
                    </div>
                </div>
            </div>
            )
    }
})

Chat = connect()(Chat)

export default Chat
