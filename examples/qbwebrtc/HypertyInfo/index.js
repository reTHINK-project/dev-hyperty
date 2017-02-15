const HypertyInfo = ({ username, avatar, runtimeHypertyURL }) => {
    return (<div className="row">
            <div className="col-xs-12">
                <div className="row">
                    <div className="col-xs-4">
                        <img src={avatar}/>
                    </div>
                    <div className="col-xs-8">
                        <div className="row">
                            <div className="col-xs-12">
                                {username}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12">
                                {runtimeHypertyURL}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);
}

export default HypertyInfo
