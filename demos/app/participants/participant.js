import React from 'react'

const Participant = (props) => {
    return (
            <div className="row">
                <div className="col-xs-2">
                    <label>
                        <input type="checkbox"/>
                    </label>
                </div>
                <div className="col-xs-10">
                    <div className="row">
                        <div className="col-xs-12">
                           <h3>Open Id Test 10</h3>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-xs-4">
                           <p>Name</p> 
                           <p>Surname</p> 
                           <p>Address</p> 
                        </div>
                        <div className="col-xs-8">
                            <p>Name</p>
                            <p>Surname</p>
                            <address>
                                Address 1355 Street
                            </address>
                        </div>
                    </div>
                </div>
            </div>
        )
}

export default Participant
