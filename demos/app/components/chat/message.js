import React, { PropTypes } from 'react'

const Message = ({content, time, name, isMe}) => {
    return(
            <li className={(isMe?"right":"left")+ "clearfix"}><span className={"chat-img pull-"+(isMe?"right":"left")}>
                <img src={isMe?"http://placehold.it/50/FA6F57/fff&amp;text=ME":"http://placehold.it/50/55C1E7/fff&amp;text=U"} alt="User Avatar" className="img-circle"/>
            </span>
                <div className="chat-body clearfix">
                    <div className="header">
                        <strong className={(isMe?"":"pull-right")+" primary-font"}>{name}</strong> <small className={(isMe?"":"pull-right")+ " text-muted"}>
                            <span className="glyphicon glyphicon-time"></span>{Math.round((((Date.now()-time) % 86400000) % 3600000) / 60000)} mins ago</small>
                    </div>
                    <p>
                        {content}
                    </p>
                </div>
            </li>
    )
}

Message.propTypes = {
    content: PropTypes.string.isRequired,
    time: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    isMe: PropTypes.bool.isRequired
}
export default Message
