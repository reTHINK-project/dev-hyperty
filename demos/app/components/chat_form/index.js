import React from 'react'
import { Link } from 'react-router'

const ChatForm = React.createClass({
    getInitialState(){
        return {chat_name: ""}
    },

    render(){
        return(
                <form>
                    <div className="form-group">
                        <label for="chatName">Name</label>
                        <input type="text" className="form-control" id="chatName" placeholder="Name" onChange={this.handleName}/>
                    </div>
                    <Link to={{pathname: 'add_participants', state:{name:this.state.chat_name}}} className="btn btn-default">Next</Link>
                </form>
        )
    },

    handleName(event){
        this.setState({chat_name: event.target.value})
    }
})

export default ChatForm
