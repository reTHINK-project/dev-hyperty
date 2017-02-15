const StatusPanel = ({state, address}) =>{
    return (<div className="row">
            <div className="col-xs-10 col-xs-offset-2">
                <strong>{address}</strong><strong>...{state}</strong>
            </div>
        </div>);
}

export default StatusPanel
