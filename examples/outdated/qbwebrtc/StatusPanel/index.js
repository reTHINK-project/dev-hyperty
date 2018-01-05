const StatusPanel = ({state, address}) =>{
    return (<div className="row">
            <div className="col-xs-10 col-xs-offset-2">
                <h5>{address} <span className="label label-info">{state}</span></h5>
            </div>
        </div>);
}

export default StatusPanel
