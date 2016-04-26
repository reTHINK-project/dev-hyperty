import React from 'react'
import ReactDOM from 'react-dom'
import Dashboard from './components/dashboard'
import ChatList from './components/chat_list'
import ChatForm from './components/chat_form'
import Participants from './components/participants'
import Chat from './components/chat'
import chatApp from './reducers'
import { createStore, applyMiddleware } from 'redux'
import {Provider} from 'react-redux'
import thunkMiddleware from 'redux-thunk'

import { Router, Route, hashHistory, IndexRoute } from 'react-router'

let store = createStore(chatApp, applyMiddleware(thunkMiddleware))
// install runtime
let runtime = undefined
let domain = 'localhost'
self.rethink.default.install({domain:domain, development: true})
    .then((r) => {
        runtime = r
        ReactDOM.render(
                <Provider store={store}>
                    <Router history={hashHistory} createElement={createElement}>
                            <Route path="/" component={Dashboard}>
                                    <IndexRoute  component={ChatList}/>
                                    <Route path="new_chat" component={ChatForm}/>
                                    <Route path="add_participants" component={Participants}/>
                                    <Route path="chat" component={Chat}/>
                            </Route>
                    </Router>
                </Provider>,
                document.getElementById('react-anchor')
        );
    })

function createElement(Component, props){
    return <Component {...props} domain={domain} runtime={runtime}/>
}
