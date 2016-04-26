import React from 'react'
import { Link } from 'react-router'

const Sidebar = (props) => {
    return(
            <ul className="nav nav-pills nav-stacked">
                <li role="presentation" className="active"><Link to="/">Chats</Link></li>
            </ul>
    )
}

export default Sidebar
