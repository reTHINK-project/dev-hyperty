import React from 'react'

const ChatListed = React.createClass({
    render(){
        return (
            <div>
                <div className="row">
                    <div className="col-xs-6">
                        <p>Heute 10:12 Uhr</p>
                    </div>
                    <div className="col-cs-6">
                        <p>3 Teilnehmer</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <h3>Old Inn Smart Hotel - Pub Crawl</h3>
                        <p> Hi Bob, Kannst Du mich nochmal arunfen heute wg genouem Treffpunk? V...</p>
                    </div>
                </div>
            </div>
        )
    }
})

export default ChatListed
