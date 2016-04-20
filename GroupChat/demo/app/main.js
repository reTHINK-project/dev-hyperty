import React from 'react'
import ReactDOM from 'react-dom'
import Dashboard from './dashboard'
import ChatList from './chat_list'
import ChatForm from './chat_form'
import Participants from './participants'
import Chat from './chat'

import { Router, Route, hashHistory, IndexRoute } from 'react-router'

ReactDOM.render(
        <Router history={hashHistory}>
                <Route path="/" component={Dashboard}>
                        <IndexRoute component={ChatList} />
                        <Route path="new_chat" component={ChatForm}/>
                        <Route path="add_participants/:chat_name" component={Participants}/>
                        <Route path="chat/:chat_name" component={Chat}/>
                </Route>
        </Router>,
        document.getElementById('react-anchor')
);
