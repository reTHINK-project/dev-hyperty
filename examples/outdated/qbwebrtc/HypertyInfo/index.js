const HypertyInfo = ({ username, avatar, runtimeHypertyURL }) => {
    return (<div className="row">
                <div className="panel panel-info">
                      <div className="panel-heading">
                        <h3 className="panel-title">Hyperty info</h3>
                      </div>
                      <div className="panel-body">
                        <div className="col-xs-2">
                            <img src={avatar} className="img-rounded img-responsive"/>
                        </div>
                        <div className="col-xs-10">
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
